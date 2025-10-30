package auth

import (
	"log"
	"net/http"
	"os"

	"backend/internal/database"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const sessionName = "auth_session"

type Auth struct {
	store *sessions.CookieStore
	db    *gorm.DB
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

func NewAuth(db *gorm.DB) *Auth {
	secret := []byte(os.Getenv("SESSION_SECRET"))
	if len(secret) == 0 {
		log.Fatal("SESSION_SECRET environment variable must be set")
	}

	store := sessions.NewCookieStore(secret)
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 30,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	return &Auth{store: store, db: db}
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

func verifyPassword(hash, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func formatValidationError(err error) string {
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		for _, fieldErr := range validationErrs {
			switch fieldErr.Field() {
			case "Email":
				if fieldErr.Tag() == "email" {
					return "Invalid email format"
				}
				if fieldErr.Tag() == "required" {
					return "Email is required"
				}
			case "Password":
				if fieldErr.Tag() == "min" {
					return "Password must be at least 6 characters"
				}
				if fieldErr.Tag() == "required" {
					return "Password is required"
				}
			case "Name":
				if fieldErr.Tag() == "required" {
					return "Name is required"
				}
			}
		}
	}
	return "Validation failed"
}

func (a *Auth) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": formatValidationError(err)})
		return
	}

	passwordHash, err := hashPassword(req.Password)
	if err != nil {
		log.Printf("Password hash error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register"})
		return
	}

	user := &database.User{
		Email:        req.Email,
		PasswordHash: passwordHash,
		Name:         req.Name,
	}

	if err := a.db.Create(user).Error; err != nil {
		log.Printf("DB create error: %v", err)
		if err.Error() == "UNIQUE constraint failed: users.email" {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register"})
		}
		return
	}

	session, _ := a.store.Get(c.Request, sessionName)
	session.Values["user_id"] = user.ID
	session.Values["email"] = user.Email
	session.Values["name"] = user.Name
	session.Save(c.Request, c.Writer)

	log.Printf("User %s registered", user.Email)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful",
		"user":    gin.H{"id": user.ID, "email": user.Email, "name": user.Name},
	})
}

func (a *Auth) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": formatValidationError(err)})
		return
	}

	var user database.User
	if err := a.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		log.Printf("User not found: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !verifyPassword(user.PasswordHash, req.Password) {
		log.Printf("Invalid password for user: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	session, _ := a.store.Get(c.Request, sessionName)
	session.Values["user_id"] = user.ID
	session.Values["email"] = user.Email
	session.Values["name"] = user.Name
	session.Save(c.Request, c.Writer)

	log.Printf("User %s logged in", user.Email)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    gin.H{"id": user.ID, "email": user.Email, "name": user.Name},
	})
}

func (a *Auth) Logout(c *gin.Context) {
	session, _ := a.store.Get(c.Request, sessionName)
	session.Options.MaxAge = -1
	session.Save(c.Request, c.Writer)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func (a *Auth) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		session, err := a.store.Get(c.Request, sessionName)
		if err != nil || session.IsNew {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		userID, ok := session.Values["user_id"].(string)
		if !ok || userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Set("email", session.Values["email"])
		c.Set("name", session.Values["name"])
		c.Next()
	}
}
