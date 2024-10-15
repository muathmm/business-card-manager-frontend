import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-add-business-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,ZXingScannerModule],
  templateUrl: './add-business-card.component.html',
  styleUrls: ['./add-business-card.component.css']
})
export class AddBusinessCardComponent  {
  businessCardForm: FormGroup;
  previewData: any = null;
  qrCodeData: string = '';

  constructor(private fb: FormBuilder) {
    this.businessCardForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      photo: [null]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const content = e.target.result;
        if (fileType === 'text/csv') {
          this.previewData = this.parseCSV(content);
        } else if (fileType === 'text/xml') {
          this.previewData = this.parseXML(content);
        }
      };

      if (fileType === 'text/csv' || fileType === 'text/xml') {
        reader.readAsText(file);
      }
    }
  }

  parseCSV(content: string): any {
    const rows = content.split('\n').map(row => row.split(','));
    return {
      name: rows[1][0],
      gender: rows[1][1],
      dateOfBirth: rows[1][2],
      email: rows[1][3],
      phone: rows[1][4],
      address: rows[1][5],
      photo: rows[1][6] // Assuming the photo URL is in the 7th column
    };
  }

  parseXML(content: string): any {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    return {
      name: xmlDoc.getElementsByTagName("name")[0].textContent,
      gender: xmlDoc.getElementsByTagName("gender")[0].textContent,
      dateOfBirth: xmlDoc.getElementsByTagName("dateOfBirth")[0].textContent,
      email: xmlDoc.getElementsByTagName("email")[0].textContent,
      phone: xmlDoc.getElementsByTagName("phone")[0].textContent,
      address: xmlDoc.getElementsByTagName("address")[0].textContent,
      photo: xmlDoc.getElementsByTagName("photo")[0].textContent // Assuming the XML has a <photo> tag
    };
  }

  processQRCode(qrData: string) {
    try {
      const data = JSON.parse(qrData);
      this.previewData = data; 
    } catch (error) {
      console.error("Invalid QR code data", error);
    }
  }

  onSubmit() {
    if (this.businessCardForm.valid) {
      const submittedData = { ...this.businessCardForm.value, ...this.previewData };
      console.log('Business Card Submitted:', submittedData);
    }
  }
}
