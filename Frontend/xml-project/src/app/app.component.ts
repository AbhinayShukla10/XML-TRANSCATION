import { Component, Inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { XmlServiceService } from './xml-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isDisabled = true;
  isUpdated = false;
  dataReceived: any;
  dataSources = new MatTableDataSource();
  datareceived: boolean | undefined;
  receiveData($event: any) {
    this.dataReceived = $event;
  }
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  datarecieved: any[]=[]
  dataSource = new MatTableDataSource();
  updatebutton: boolean = false;
  displayedColumns = ['receipt_no', 'name','bank_name',  'amount', 'date', 'time', 'country', 'state', 'city','Action'];
  constructor(@Inject('jsPDF') private jsPDF: jsPDF,private uploadService: XmlServiceService, private service: XmlServiceService,private http: HttpClient) {
  }
  async ngOnInit(): Promise<void> {
    await this.getXmldetails();
    
  }
  XmlForm = new FormGroup({
    ReceiptNo  : new FormControl('', [Validators.required]),
    Name  :new FormControl('', [ Validators.required, Validators.pattern('^[a-zA-Z  ]*$')]),
    BankName  : new FormControl('', [ Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
    Location  : new FormControl('', [ Validators.required, Validators.pattern('^[a-zA-Z  ,  ]*$')]),
    date  : new FormControl('', [Validators.required]),
    Time  : new FormControl('', [Validators.required]),
    Amount  : new FormControl('', [  Validators.required]),
  });
  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    this.progress = 0;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.uploadService.upload(this.currentFile).subscribe(
          (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
            } else if (event instanceof HttpResponse) {
              this.message = event.body.message;
            setTimeout(() => {
      window.location.reload();
    }, 1000);
            }
          },
          (err: any) => {
            console.log(err);
            this.progress = 0;

            if (err.error && err.error.message) {
              this.message = err.error.message;
            } else {
              this.message = 'Could not upload the file!';
            }

            this.currentFile = undefined;
          });

      }

      this.selectedFiles = undefined;
    }
  }  
  async getXmldetails() {
    const rel = await this.service.getXmldetail();
    console.log("rel ka data",rel)
    if (rel) {
      this.dataSource.data = this.service.datarecieved;
      return;
    }
    
    return false;
  }
  
  

onViewClick(rowData: any) {
  console.log("view mw aaya ");
  
  this.XmlForm.patchValue({
    ReceiptNo: rowData.id,
    Name: rowData.name,
    BankName: rowData.bank_name,
    Location: `${rowData.city}, ${rowData.state}, ${rowData.country}`,
    date:rowData.date,
    Time:moment(rowData.time, 'HH:mm').format('HH:mm'),
    Amount: rowData.amount
  });
  this.XmlForm.disable();
  this.updatebutton = false;
}
Edit(rowData: any) {
  console.log("edit mw aaya ");
  this.XmlForm.patchValue({
    ReceiptNo: rowData.id,
    
    Name: rowData.name,
    BankName: rowData.bank_name,
    Location: `${rowData.city}, ${rowData.state}, ${rowData.country}`,
    date:  rowData.date,
    Time: moment(rowData.time, 'HH:mm').format('HH:mm'),
    Amount: rowData.amount
  });

 

  // this.XmlForm.enable();
  const receiptNoControl = this.XmlForm.get('ReceiptNo');
// if (receiptNoControl) {
  // receiptNoControl.disable(); 
// }
  this.updatebutton = true;
}



async updateXmldata(formData: any) {
  console.log("update xml form data: ", formData);

  const receiptNo = formData.ReceiptNo;
  const bankName = formData.BankName?.trim();
  const name = formData.Name?.trim();
  const location = formData.Location?.trim();
  
  const locationParts = location.split(',');
  const city = locationParts[0]?.trim();
  const state = locationParts[1]?.trim();
  const country = locationParts[2]?.trim();

  const date = formData.date;
  const time = moment(formData.Time, 'HH:mm').format('HH:mm');

  const amount = formData.Amount;

  const data = {
    ReceiptNo: receiptNo,
    Name: name,
    BankName: bankName,
    City: city,
    State: state,
    Country: country,
    Date: date,
    Time: time,
    Amount: amount
  };
  
  console.log("updated xml form data: ", data);

  try {
    
    const response = await this.http.post('http://127.0.0.1:8000/api/updateXmlData', data).toPromise();
    console.log("XML data update successful: ", response);
    this.isUpdated = true;
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.log("Error updating XML data: ", error);
  
    throw new Error('Failed to update XMLTask');
  }
 
}

downloadPdf(rowData: any): void {
  const doc: jsPDF = new jsPDF();
  const date = new Date(rowData.date);
  const day = date.getDate().toString();
  const month = (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString(); 
  const formattedDate = `${day}/${month}/${year}`;
  
  const data: Array<Array<string>> = [
    ['Receipt No', rowData.id.toString()],
    ['Name', rowData.name],
    ['Bank Name', rowData.bank_name],
    ['Location', `${rowData.city}, ${rowData.state}, ${rowData.country}`],
    ['Date', formattedDate],
    ['Time', moment(rowData.time, 'HH:mm').format('HH:mm')],
    ['Amount', rowData.amount.toString()],
  ];
   const columnWidths = [60, 80];
  const tableOptions = {
    startY: 40,
    margin: { top: 10 },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 1,
      lineWidth: 0.1,
      fillColor: false,
    },
    alternateRowStyles: {
      fillColor: false,
    },
    headerStyles: {
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      fillColor: [255, 255, 255],
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
    columnWidths: columnWidths,
  }; 
  (doc as any).autoTable({  
    body: data,
    ...tableOptions,
  });
  const title: string = 'Transaction Slip';
  doc.text('Transaction Slip', 90, 30);

  doc.save('receipt.pdf');
}


  
}



