package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	_ "github.com/joho/godotenv/autoload"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type User struct {
	ID           string `gorm:"primaryKey"`
	Email        string `gorm:"uniqueIndex;not null"`
	PasswordHash string `gorm:"not null"`
	Name         string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type Cart struct {
	ID        string `gorm:"primaryKey"`
	UserID    string `gorm:"uniqueIndex;not null;foreignKey:ID;references:User.ID"`
	CreatedAt time.Time
	UpdatedAt time.Time

	CartItems []CartItem `gorm:"foreignKey:CartID;constraint:OnDelete:CASCADE;"`
}

type Product struct {
	ID          int `gorm:"primaryKey"`
	Title       string
	Price       float64
	Description string
	Category    string
	Image       string
	Rating      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type CartItem struct {
	ID        string  `gorm:"primaryKey"`
	CartID    string  `gorm:"index;not null;foreignKey:ID;references:Cart.ID"`
	ProductID int     `gorm:"not null"`
	Quantity  int     `gorm:"not null"`
	Product   Product `gorm:"foreignKey:ProductID;references:ID"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

func (c *Cart) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

func (ci *CartItem) BeforeCreate(tx *gorm.DB) error {
	if ci.ID == "" {
		ci.ID = uuid.New().String()
	}
	return nil
}

var (
	dbUrl      = os.Getenv("DB_URL")
	dbInstance *gorm.DB
)

func New() *gorm.DB {
	if dbInstance != nil {
		return dbInstance
	}

	dbAuthToken := os.Getenv("DB_AUTH_TOKEN")
	fullDBURL := fmt.Sprintf("%s?authToken=%s", dbUrl, dbAuthToken)

	sqlDB, err := sql.Open("libsql", fullDBURL)
	if err != nil {
		panic(fmt.Sprintf("Failed to open Turso database: %v", err))
	}

	db, err := gorm.Open(sqlite.Dialector{Conn: sqlDB}, &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	dbInstance = db

	if err := db.AutoMigrate(&User{}, &Product{}, &Cart{}, &CartItem{}); err != nil {
		log.Printf("migration error: %v", err)
	}

	seedProducts(db)

	return dbInstance
}

func Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	sqlDB, err := dbInstance.DB()
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("failed to get underlying sql.DB: %v", err)
		log.Fatalf("db down: %v", err)
		return stats
	}

	err = sqlDB.PingContext(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err)
		return stats
	}

	stats["status"] = "up"
	stats["message"] = "It's healthy"

	dbStats := sqlDB.Stats()
	stats["open_connections"] = strconv.Itoa(dbStats.OpenConnections)
	stats["in_use"] = strconv.Itoa(dbStats.InUse)
	stats["idle"] = strconv.Itoa(dbStats.Idle)
	stats["wait_count"] = strconv.FormatInt(dbStats.WaitCount, 10)
	stats["wait_duration"] = dbStats.WaitDuration.String()
	stats["max_idle_closed"] = strconv.FormatInt(dbStats.MaxIdleClosed, 10)
	stats["max_lifetime_closed"] = strconv.FormatInt(dbStats.MaxLifetimeClosed, 10)

	if dbStats.OpenConnections > 40 {
		stats["message"] = "The database is experiencing heavy load."
	}

	if dbStats.WaitCount > 1000 {
		stats["message"] = "The database has a high number of wait events, indicating potential bottlenecks."
	}

	if dbStats.MaxIdleClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many idle connections are being closed, consider revising the connection pool settings."
	}

	if dbStats.MaxLifetimeClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many connections are being closed due to max lifetime, consider increasing max lifetime or revising the connection usage pattern."
	}

	return stats
}

func Close() error {
	log.Printf("Disconnected from database: %s", dbUrl)
	sqlDB, err := dbInstance.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func seedProducts(db *gorm.DB) {
	type FakeStoreProduct struct {
		ID       int     `json:"id"`
		Title    string  `json:"title"`
		Price    float64 `json:"price"`
		Desc     string  `json:"description"`
		Category string  `json:"category"`
		Image    string  `json:"image"`
		Rating   struct {
			Rate  float64 `json:"rate"`
			Count int     `json:"count"`
		} `json:"rating"`
	}

	res, err := http.Get("https://fakestoreapi.com/products")
	if err != nil {
		log.Printf("error fetching products from fakestoreapi: %v", err)
		return
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		log.Printf("error reading response body: %v", err)
		return
	}

	var fakeStoreProducts []FakeStoreProduct
	if err := json.Unmarshal(body, &fakeStoreProducts); err != nil {
		log.Printf("error unmarshaling products: %v", err)
		return
	}

	for _, fsp := range fakeStoreProducts {
		product := Product{
			ID:          fsp.ID,
			Title:       fsp.Title,
			Price:       fsp.Price,
			Description: fsp.Desc,
			Category:    fsp.Category,
			Image:       fsp.Image,
		}

		if err := db.Where("id = ?", product.ID).FirstOrCreate(&product).Error; err != nil {
			log.Printf("error seeding product %d: %v", product.ID, err)
		}
	}

	log.Printf("seeded %d products from fakestoreapi", len(fakeStoreProducts))
}
