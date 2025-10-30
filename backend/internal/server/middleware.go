package server

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			statusCode := http.StatusInternalServerError

			if c.Writer.Status() != http.StatusOK {
				statusCode = c.Writer.Status()
			}

			c.JSON(statusCode, gin.H{
				"error": err.Error(),
			})
		}
	}
}

func PanicRecovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				var message string
				switch x := r.(type) {
				case string:
					message = x
				case error:
					message = x.Error()
				default:
					message = fmt.Sprintf("%v", x)
				}

				c.JSON(http.StatusInternalServerError, gin.H{
					"error": message,
				})
				c.Abort()
			}
		}()

		c.Next()
	}
}
