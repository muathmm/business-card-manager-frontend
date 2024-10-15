import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // This ensures that the service is available at the root level
})
export class BusinessCardService {
  private apiUrl = 'http://businesscards.runasp.net/api/BusinessCards'; // API endpoint for business cards

  constructor(private http: HttpClient) {} // Inject HttpClient for making HTTP requests

  // Fetch all business cards from the server
  getBusinessCards(): Observable<any[]> {
    console.log("Fetching business cards from the server");
    let res = this.http.get<any[]>(this.apiUrl); // Make GET request to the API
    console.log(res); // Log the response to the console
    return res; // Return the observable response
  }

  // Update an existing business card on the server
  updateBusinessCard(card: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${card.id}`, card); // Use the card's ID for the PUT request
  }

  // Delete a business card from the server
  deleteBusinessCard(cardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cardId}`); // Make DELETE request using the card ID
  }

  // Add a new business card to the server (POST request)
  addBusinessCard(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData); // Send the form data to the API
  }
  exportBusinessCardsToXml(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/xml`, { responseType: 'blob' });
  }

  exportBusinessCardsToCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, { responseType: 'blob' });
  }
}
