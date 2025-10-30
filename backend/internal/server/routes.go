package server

import (
	"net/http"

	"backend/internal/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.GET("/health", s.healthHandler)
	r.POST("/auth/register", s.auth.Register)
	r.POST("/auth/login", s.auth.Login)
	r.POST("/auth/logout", s.auth.Logout)

	protected := r.Group("/")
	protected.Use(s.auth.Middleware())
	protected.GET("/cart", s.getCartHandler)
	protected.POST("/cart", s.setCartHandler)
	protected.GET("/me", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("user_id")})
	})
	return r
}

func (s *Server) healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, database.Health())
}
