package database

import (
	"fmt"

	"XmlTransacation/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {

	// db connection
	dsn := "host=localhost user=postgres password=postgres dbname=xml_local port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic(err)
	}
	DB = database
	fmt.Println("Connected!", database)

	AutoMigrate(database)

}
func AutoMigrate(connection *gorm.DB) {
	connection.Debug().AutoMigrate(
		&models.XMLTask{},
	)

}
