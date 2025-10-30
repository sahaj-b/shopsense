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

	r.GET("/", s.HelloWorldHandler)

	r.GET("/health", s.healthHandler)
	r.POST("/auth/register", s.auth.Register)
	r.POST("/auth/login", s.auth.Login)
	r.POST("/auth/logout", s.auth.Logout)

	protected := r.Group("/")
	protected.Use(s.auth.Middleware())
	protected.GET("/cart", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		email, _ := c.Get("email")
		name, _ := c.Get("name")
		c.JSON(http.StatusOK, gin.H{
			"message": "This is a protected cart endpoint",
			"user": gin.H{
				"id":    userID,
				"email": email,
				"name":  name,
			},
		})
	})

	return r
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	c.JSON(http.StatusOK, resp)
}

func (s *Server) healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, database.Health())
}
