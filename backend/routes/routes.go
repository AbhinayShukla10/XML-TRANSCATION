package routes

import (
	"XmlTransacation/controllers"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	app.Get("/", controllers.XML)
	app.Post("/api/XMLEntryBackend", controllers.XMLEntryBackends)
	app.Get("/api/GetXMLDataByid", controllers.GetXMLDataByid)
	app.Post("/api/UpdateXmlData", controllers.UpdateXmlData)
}
