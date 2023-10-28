export class XmlMasterModel {
  constructor(
    receiptNo: number,
    name: string,
    bankName: string,
    location: string,
    Date: string, // corrected typo
    Time: string,
    amount: string
  ) {
    this.ReceiptNo = receiptNo;
    this.Name = name;
    this.BankName = bankName;
    this.Location = location;
    this.Date = Date;
    this.Time = Time;
    this.Amount = amount;
  }
  ReceiptNo: number;
  Name: string;
  BankName: string;
  Location: string;
  Date: string; // corrected typo
  Time: string;
  Amount: string;

  updateToJSON(): Map<string, any> {
    const data: Map<string, any> = new Map<string, any>();
    data.set('ReceiptNo', this.ReceiptNo);
    data.set('Name', this.Name);
    data.set('BankName', this.BankName);
    data.set('Location', this.Location);
    data.set('Date', this.Date); // corrected typo
    data.set('Time', this.Time);
    data.set('Amount', this.Amount);
    return data;
  }
}
