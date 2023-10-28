import { HttpErrorResponse, HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { XMLEntryBackends, getXMLDataByid } from 'src/configs/apiUrls';
import { XmlMasterModel } from './Xml-Master';
// import { GetXMLDataByid } from 'src/configs/apiUrls';

@Injectable({
  providedIn: 'root'
})
export class XmlServiceService {
  private baseUrl = 'http://localhost:8000';
  datarecieved: any[]=[]
  httpErrorMessage: any;

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/api/XMLEntryBackend`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
  public async getXmldetail() {
    return await this.http
      .get<{ data: any[] }>('http://127.0.0.1:8000/api/GetXMLDataByid')
      .toPromise()
      .then(response => {
        console.log("tag data", response)
        this.datarecieved = response?.data ?? [];
        console.log(this.datarecieved,"data aaraha hai backend se ")
        return true;
      })
      .catch(error => this.errorHandler(error))
  }

  
  
  errorHandler(error: HttpErrorResponse): boolean {
    if (error.status === 400) {
      this.httpErrorMessage = error.error['message'];
    } else if (error.status === 403) {
      this.httpErrorMessage = `Forbidden. You don't have enough rights.`;
    } else if (error.status === 413) {
      this.httpErrorMessage = `File size should be less than 20 MB.`;
    } else if (error.status === 401) {
      if (error.error['type'] == 'Unauthorized') {
        this.httpErrorMessage = error.error['message'];
      } 
    } else {
      this.httpErrorMessage = 'Your session is invalid. Kindly close the browser and login again';
    }
    return false;
  }
//   public async UpadteXmlData(Xml: XmlMasterModel): Promise<boolean> {
//     const json = Object.fromEntries(Xml.updateToJSON());
//     const jsonString = JSON.stringify(json);

//     console.log("JSON string:", jsonString);
//     console.log("data check",Xml); // add this line

//     return await this.http
    
//         .post<{ data: any[] }>('http://127.0.0.1:8000/api/updateXmlData', jsonString)
//         .toPromise()
//         .then(response => {
//             return true;
//         })
//         .catch(error => this.errorHandler(error));
// }


}
