package models

import "time"

type XMLTask struct {
	ReceiptNo int64     `gorm:"primary_key;column:receipt_no;" json:"id"`
	Name      string    `gorm:"column:name" json:"name"`
	BankName  string    `gorm:"column:bank_name" json:"bank_name"`
	Country   string    `gorm:"column:country" json:"country"`
	State     string    `gorm:"column:state" json:"state"`
	City      string    `gorm:"column:city" json:"city"`
	Amount    float64   `gorm:"column:amount" json:"amount"`
	Date      time.Time `gorm:"column:date" json:"date"`
	Time      string    `gorm:"column:time" json:"time"`
}

func (XMLTask) TableName() string {
	return "tbl_xml_task"
}
