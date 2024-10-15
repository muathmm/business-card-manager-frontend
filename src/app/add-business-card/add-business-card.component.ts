import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BusinessCardService } from '../services/business-card.service';
import jsQR from 'jsqr';

@Component({
  selector: 'app-add-business-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ZXingScannerModule],
  templateUrl: './add-business-card.component.html',
  styleUrls: ['./add-business-card.component.css']
})
export class AddBusinessCardComponent {
  showScanner: boolean = false; // Condition for specifying the scanner width
  businessCardForm: FormGroup;
  previewData: any = null;
  qrCodeData: string = '';
  selectedFile: File | null = null; 

 // Constructor initializes the business card form with default values and validation rules.
constructor(private fb: FormBuilder, private businessCardService: BusinessCardService) {
  this.businessCardForm = this.fb.group({
      Name: [''],
      Gender: [''],
      DateOfBirth: [''],
      Email: [''],
      Phone: [''],
      Address: [''],
      Photo: [''],
      QrCodeData: [''],
      method: ['manual', Validators.required]
  });
}


 // Clears the form data and resets the form controls, while handling date changes to store them in ISO format.
clearFormData() {
  this.previewData = null; // Clear preview data
  this.businessCardForm.reset({ method: this.businessCardForm.get('method')?.value });
}

onDateChange(event: Event) {
  const selectedDate = (event.target as HTMLInputElement).value; // Get the selected date in YYYY-MM-DD format
  const dateTime = new Date(selectedDate).toISOString(); // Convert it to ISO format
  console.log(dateTime); // Outputs: 1985-10-03T00:00:00.000Z (or your local timezone equivalent)
  // You can now store this dateTime in your form control or use it as needed
}


  // Handles the file input change event, reading the selected file and parsing its content for preview.
// Supports CSV and XML file formats and updates the form with the parsed data.
onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
      this.selectedFile = file; // Store the file for sending to the server

      // Read the file to display a preview only
      const fileType = file.type;
      const reader = new FileReader();

      reader.onload = (e: any) => {
          const content = e.target.result;
          if (fileType === 'text/csv') {
              this.previewData = this.parseCSV(content);
          } else if (fileType === 'text/xml') {
              this.previewData = this.parseXML(content);
          }

          // Update the form with the new values from previewData
          this.updateFormWithPreviewData(this.previewData);
      };

      if (fileType === 'text/csv' || fileType === 'text/xml') {
          reader.readAsText(file);
      }
  }
}


  // Parses the CSV content and extracts business card details into an object.
// Assumes the first row is the header and extracts values from the second row.
parseCSV(content: string): any {
  const rows = content.split('\n').map(row => row.split(','));
  return {
      Name: rows[1][0],
      Gender: rows[1][1],
      DateOfBirth: rows[1][2],
      Email: rows[1][3],
      Phone: rows[1][4],
      Address: rows[1][5],
      Photo: `data:image/jpeg;base64,${rows[1][6]}` // Assuming the photo URL is in the 7th column
  };
}


  // Parses the XML content and extracts business card details into an object.
// Assumes the XML structure contains specific tags for each field.
parseXML(content: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");
  return {
      Name: xmlDoc.getElementsByTagName("name")[0].textContent,
      Gender: xmlDoc.getElementsByTagName("gender")[0].textContent,
      DateOfBirth: xmlDoc.getElementsByTagName("dateOfBirth")[0].textContent,
      Email: xmlDoc.getElementsByTagName("email")[0].textContent,
      Phone: xmlDoc.getElementsByTagName("phone")[0].textContent,
      Address: xmlDoc.getElementsByTagName("address")[0].textContent,
      Photo: `data:image/jpeg;base64,${xmlDoc.getElementsByTagName("photo")[0].textContent}` // Assuming the XML has a <photo> tag
  };
}


 // Handles the result of the scanned QR code by hiding the scanner,
// updating the form with the QR code data, and processing the QR code.
onCodeResult(result: string) {
  this.showScanner = false; // Hide the scanner after scanning
  this.businessCardForm.patchValue({ qrCodeData: result }); // Update the field with QR code

  // Call the function to process the QR code and extract the data
  this.processQRCode(result);
}



 // Processes the scanned QR code by parsing its JSON data,
// updating the business card form with the extracted values,
// and handling any parsing errors.
processQRCode(qrCode: string) {
  console.log('QR Code scanned:', qrCode);
  
  // Assume the QR code data is encoded in JSON format
  try {
      const qrData = JSON.parse(qrCode); // Convert JSON string to an object
      
      // Update the business card form with the extracted values
      this.businessCardForm.patchValue({
          Name: qrData.Name || '',
          Gender: qrData.Gender || '',
          DateOfBirth: qrData.DateOfBirth || '',
          Email: qrData.Email || '',
          Phone: qrData.Phone || '',
          Address: qrData.Address || '',
          Photo: qrData.Photo || '', // Assume the photo is encoded in Base64
          QrCodeData: qrCode // Store the QR code in the form as well
      });

      console.log('Business card form updated with QR data:', this.businessCardForm.value);
  } catch (error) {
      console.error('Error parsing QR code data:', error);
  }
}


  // Handles the change event for uploading a QR code image, 
// reads the image file, extracts the QR code using a canvas,
// and processes the QR code data if found.
onQRImageChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
          const imageDataUrl = e.target.result;
          console.log('QR Image Loaded:', imageDataUrl);

          // Convert image data to an Image object
          const img = new Image();
          img.src = imageDataUrl;

          img.onload = () => {
              // Create a canvas element to draw the image
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');

              // Ensure the context is not null
              if (context) {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  context.drawImage(img, 0, 0, img.width, img.height);

                  // Extract pixel data from the canvas element
                  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                  const code = jsQR(imageData.data, canvas.width, canvas.height);

                  if (code) {
                      console.log('QR Code scanned from image:', code.data);
                      this.processQRCode(code.data); // Process the scanned QR code
                  } else {
                      console.log('No QR code found in the image.');
                  }
              } else {
                  console.error('Failed to get 2D context from canvas');
              }
          };
      };
      reader.readAsDataURL(file);
  }
}


  // Opens the scanner interface when the camera button is pressed.
openCamera(): void {
  this.showScanner = true; // Show the scanner when the camera button is clicked
}

// Updates the business card form with data from the preview.
updateFormWithPreviewData(previewData: any) {
  if (previewData) {
      console.log(previewData);
      this.businessCardForm.patchValue({
          Name: previewData.Name,
          Gender: previewData.Gender,
          DateOfBirth: previewData.DateOfBirth,
          Email: previewData.Email,
          Phone: previewData.Phone,
          Address: previewData.Address,
          Photo: previewData.Photo
      });
  }
}

// Handles the drop event for files, allowing drag-and-drop functionality to upload files.
onDrop(event: DragEvent) {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
      this.onFileChange({ target: { files } }); // Trigger file change handling
  }
}

  
 // Handles the file selection event, validating the file size and type before converting the image to Base64.
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
      // Check the file size (for example, the maximum is 1 megabyte)
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSizeInBytes) {
          console.error('File size exceeds the allowed limit of 1 megabyte.');
          alert('File size exceeds the allowed limit of 1 megabyte.');
          return;
      }

      // Check the file type (must be JPEG or PNG)
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
          console.error('Unsupported file format. Must be JPEG or PNG.');
          alert('Unsupported file format. Must be JPEG or PNG.');
          return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
          const base64Image = e.target.result;
          console.log('Base64 Image:', base64Image); // Check the Base64 value
          // Update the Photo field in the form to hold the image in Base64 format
          this.businessCardForm.patchValue({
              Photo: base64Image
          });
          console.log('Photo field value:', this.businessCardForm.get('Photo')?.value); // Check the field value
      };
      reader.readAsDataURL(file);
  }
}


  // Handles the form submission, validating the form data, preparing it for submission, and sending it to the server.
onSubmit() {
  if (this.businessCardForm.valid) {
      const formData = new FormData();

      // Add the image converted to Base64
      const photoBase64 = this.businessCardForm.get('Photo')?.value.toString();
      console.log('Photo Base64:', photoBase64); // Check the Base64 value

      if (photoBase64) {
          formData.append('PhotoBase64', photoBase64); // Add the image to FormData
      } else {
          console.error('Photo is null or empty');
      }

      // If a file (XML or CSV) is selected
      if (this.selectedFile) {
          formData.append('file', this.selectedFile);
          console.log('file:', formData.get("file")); // Check the file value
      }

      // If a QR image is specified
      if (this.businessCardForm.get('qrCodeData')?.value instanceof File) {
          formData.append('qrCodeImage', this.businessCardForm.get('qrCodeData')?.value);
      } else if (this.businessCardForm.get('qrCodeData')?.value) {
          formData.append('qrCodeData', this.businessCardForm.get('qrCodeData')?.value);
      }

      // Add other form data to FormData
      Object.keys(this.businessCardForm.controls).forEach(key => {
          const controlValue = this.businessCardForm.get(key)?.value;
          if (controlValue && key !== 'file' && key !== 'qrCodeData' && key !== 'PhotoBase64') {
              formData.append(key, controlValue);
          }
      });

      console.log('Business Card Submitted:', formData.get('Photo'));

      // Send data to the server using BusinessCardService
      this.businessCardService.addBusinessCard(formData).subscribe({
          next: (response) => {
              if (response && response.message === "Add card Successfully") {
                  console.log('Business card added successfully:', response);
                  alert('Business card sent successfully!');
                  this.businessCardForm.reset({ method: 'manual' });
                  this.previewData = null;
                  this.selectedFile = null;
              } else {
                  console.error('Unexpected response:', response);
                  alert('There was an error in the server response.');
              }
          },
          error: (error) => {
              console.error('Error adding business card:', error);
              alert('There was an error sending your business card. Please try again.');
          }
      });
  } else {
      alert('Please fill in all required fields.');
  }
}

}
