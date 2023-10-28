package main

import (
	"XmlTransacation/database"
	"XmlTransacation/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// db connection
	database.Connect()

	// fiber for hosting
	app := fiber.New()

	// Configure CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Handle OPTIONS requests
	app.Options("/*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	// Setup routes
	routes.Setup(app)

	// Start the Fiber app
	app.Listen(":8000")
}
