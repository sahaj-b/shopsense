package server

import (
	"fmt"
	"log"
	"net/http"

	"backend/internal/database"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CartItemRequest struct {
	ProductID int `json:"productId" binding:"required,min=1"`
	Quantity  int `json:"quantity" binding:"required,min=1"`
}

type SetCartRequest struct {
	CartItems []CartItemRequest `json:"cartItems" binding:"required,min=0"`
}

func (s *Server) getCartHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	log.Printf("User ID: %v", userID)
	var cart database.Cart
	result := s.db.Preload("CartItems.Product").Where("user_id = ?", userID).First(&cart)
	if result.Error == gorm.ErrRecordNotFound {
		log.Println("No cart found for user")
		c.JSON(http.StatusOK, gin.H{"cart": nil})
		return
	} else if result.Error != nil {
		log.Printf("Error retrieving cart: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve cart"})
		return
	}

	log.Printf("############# CART GET ############# CartItems count: %d", len(cart.CartItems))
	for i, item := range cart.CartItems {
		log.Printf("Item %d: ProductID=%d, Product.ID=%d, Product.Title=%s, Quantity=%d",
			i, item.ProductID, item.Product.ID, item.Product.Title, item.Quantity)
	}
	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

func (s *Server) setCartHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req SetCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid cart data: %v", err)})
		return
	}

	for i, item := range req.CartItems {
		if item.ProductID < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid product_id at item %d: must be >= 1", i)})
			return
		}
		if item.Quantity < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid quantity at item %d: must be >= 1", i)})
			return
		}
	}

	cartItems := make([]database.CartItem, len(req.CartItems))
	for i, item := range req.CartItems {
		cartItems[i] = database.CartItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
		}
	}

	var cart database.Cart
	result := s.db.Where("user_id = ?", userID).First(&cart)

	if result.Error == gorm.ErrRecordNotFound {
		cart = database.Cart{
			UserID:    userID.(string),
			CartItems: cartItems,
		}
		if err := s.db.Create(&cart).Error; err != nil {
			log.Printf("[ERROR] Failed to create cart for user %s: %v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
			return
		}
	} else if result.Error != nil {
		log.Printf("[ERROR] Failed to retrieve cart for user %s: %v", userID, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve cart"})
		return
	} else {
		if err := s.db.Where("cart_id = ?", cart.ID).Delete(&database.CartItem{}).Error; err != nil {
			log.Printf("[ERROR] Failed to delete old cart items for cart %s: %v", cart.ID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
			return
		}

		cart.CartItems = cartItems
		if err := s.db.Save(&cart).Error; err != nil {
			log.Printf("[ERROR] Failed to save cart for user %s: %v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
			return
		}
	}
	log.Printf("############# CART SET ############# %v", cartItems)
	c.JSON(http.StatusOK, gin.H{"cart": cart})
}
