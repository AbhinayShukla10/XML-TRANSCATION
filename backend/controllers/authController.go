package controllers

import (
	"github.com/gofiber/fiber/v2"
)

func XML(c *fiber.Ctx) error {
	return c.SendString("Hello, Xml is called")
}
