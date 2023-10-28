package controllers

import (
	"encoding/xml"
	"errors"
	"fmt"
	"log"
	"math"
	"strings"

	"XmlTransacation/database"
	"XmlTransacation/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Location struct {
}

type Transaction struct {
	ReceiptNo int64   `xml:"ID"`
	Name      string  `xml:"name" trim:"true"`
	BankName  string  `xml:"bankname" trim:"true"`
	Amount    float64 `xml:"amount"`
	Date      string  `xml:"date" layout:"02 January 2006"`
	Time      string  `xml:"time"`
	Country   string  `xml:"location>country" trim:"true"`
	State     string  `xml:"location>state" trim:"true"`
	City      string  `xml:"location>city" trim:"true"`
}

type Transactions struct {
	XMLName      xml.Name      `xml:"Transactions"`
	Transactions []Transaction `xml:"Transaction"`
}

func (task *Transaction) BeforeSave(tx *gorm.DB) error {
	task.Name = strings.TrimSpace(task.Name)
	task.BankName = strings.TrimSpace(task.BankName)
	task.Country = strings.TrimSpace(task.Country)
	task.State = strings.TrimSpace(task.State)
	task.City = strings.TrimSpace(task.City)
	task.Time = strings.TrimSpace(task.Time)
	task.Date = strings.TrimSpace(task.Date)
	return nil
}

func XMLEntryBackends(c *fiber.Ctx) error {
	log.Println("XMLEntryBackends called")
	c.Set("Access-Control-Allow-Origin", "*")

	// Parse the multipart/form-data request
	form, err := c.MultipartForm()
	if err != nil {
		log.Printf("Error parsing form: %s", err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Get the uploaded file
	files := form.File["file"]
	if len(files) == 0 {
		log.Println("No file uploaded")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "no file uploaded",
		})
	}

	file, err := files[0].Open()
	if err != nil {
		log.Printf("Error opening file: %s", err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	defer file.Close()

	// Read the file contents here and process it
	transactions := &Transactions{}
	if err := xml.NewDecoder(file).Decode(transactions); err != nil {
		log.Printf("Error decoding XML: %s", err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Save the transactions into the database table
	for i := 0; i < len(transactions.Transactions); i++ {
		tx := transactions.Transactions[i]

		// Check if the transaction already exists in the database based on the ID primary key
		existingTx := &Transaction{}
		result := database.DB.Table("tbl_xml_task").Where("receipt_no = ?", tx.ReceiptNo).First(existingTx)
		if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
			log.Printf("Error querying database: %s", result.Error.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}
		if existingTx.ReceiptNo == tx.ReceiptNo {
			log.Printf("Transaction with ReceiptNo %d already exists in the database, skipping", tx.ReceiptNo)
			continue
		}

		// Create a new transaction in the database
		result = database.DB.Table("tbl_xml_task").Create(&Transaction{

			ReceiptNo: tx.ReceiptNo,
			Name:      tx.Name,
			BankName:  tx.BankName,
			Amount:    tx.Amount,
			Date:      tx.Date,
			Time:      tx.Time,
			City:      tx.City,
			State:     tx.State,
			Country:   tx.Country,
		})
		if result.Error != nil {
			log.Printf("Error creating transaction in database: %s", result.Error.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}
	}

	log.Println("File uploaded and processed successfully")
	log.Printf("Transactions: %+v", transactions)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "file uploaded and processed successfully",
	})
}

func GetXMLDataByid(c *fiber.Ctx) error {
	var XMLTask []models.XMLTask
	result := database.DB.Order("tbl_xml_task").Find(&XMLTask)
	if result.Error != nil {
		log.Printf("Error retrieving XML tasks: %s", result.Error.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Error retrieving XML tasks",
			"error":   result.Error.Error(),
		})
	}
	for i := range XMLTask {
		if math.IsNaN(XMLTask[i].Amount) {
			XMLTask[i].Amount = 0.0
		}
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    XMLTask,
	})
}

func UpdateXmlData(ctx *fiber.Ctx) error {
	// Parse the payload JSON into a Transaction struct.
	fmt.Print("update eme aaya hai")
	var payload Transaction
	err := ctx.BodyParser(&payload)
	if err != nil {
		return fmt.Errorf("failed to parse request body: %v", err)
	}

	// Update the record in the database.
	result := database.DB.Table("tbl_xml_task").
		Where("receipt_no = ?", payload.ReceiptNo).
		UpdateColumns(map[string]interface{}{
			"name":      payload.Name,
			"bank_name": payload.BankName,
			"city":      payload.City,
			"state":     payload.State,
			"amount":    payload.Amount,
			"date":      payload.Date,
			"time":      payload.Time,
			"country":   payload.Country,
		})
	fmt.Print("update eme aaya hai 2")
	if result.Error != nil {
		return fmt.Errorf("failed to update XML data: %v", result.Error)
	}

	return nil
}
