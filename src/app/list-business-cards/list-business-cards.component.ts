import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BusinessCardService } from '../services/business-card.service';
import { SplashService } from './splash.service'

@Component({
  selector: 'app-list-business-cards',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './list-business-cards.component.html',
  styleUrls: ['./list-business-cards.component.css']
})
export class ListBusinessCardsComponent implements OnInit {
  showSplash: boolean = true;
  searchTerm: string = ''; // Holds the search term for filtering cards
  selectedGender: string = ''; // Holds the selected gender filter
  exportFormat: string = ''; // Holds the selected export format
  businessCards: any[] = []; // Array to store the fetched business cards
  filteredCards: any[] = []; // Array to store filtered business cards
  isEditModalOpen: boolean = false; // Flag to control edit modal visibility
  editedCard: any = {}; // Object to store the card being edited
  currentPage: number = 1; // Current page for pagination
  itemsPerPage: number = 3; // Number of items displayed per page
  totalPages: number = 1; // Total number of pages for pagination
  displayedCards: any[] = []; // Array to hold the currently displayed cards

  constructor(private businessCardService: BusinessCardService,private splashService: SplashService) {}

  ngOnInit() {
    if (!this.splashService.hasShownSplash()) {
      this.showSplash = true;
      this.splashService.setSplashShown(true);

   
      setTimeout(() => {
        this.showSplash = false;
      }, 10000);
    } else {
      this.showSplash = false; 
    }
   // Load business cards when the component initializes
    this.loadBusinessCards();
    
 
  
  }

  // Fetches business cards from the service and maps photo URLs
  loadBusinessCards() {
   

    this.businessCardService.getBusinessCards().subscribe({
      next: (cards) => {
        this.businessCards = cards.map(card => {
          return {
            ...card,
            photoUrl: `data:image/jpeg;base64,${card.photoBase64}`,
            date: card.dateOfBirth.toString().split('T')[0]  // Format photo URL
          };
        });
        this.filterCards(); // Apply filtering after loading cards
      },
      error: (error) => {
        console.error('Error fetching business cards:', error);
      }
    });
  }

  // Filters business cards based on search term and selected gender
  filterCards() {
    this.filteredCards = this.businessCards.filter(card =>
      card.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.selectedGender ? card.gender.toLowerCase() === this.selectedGender.toLowerCase() : true)
    );
    this.updatePagination(); // Update pagination after filtering
  }

  // Updates pagination variables based on filtered cards
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCards.length / this.itemsPerPage); 
    this.displayedCards = this.filteredCards.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage); 
  }

  // Navigates to the previous page in the pagination
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedCards(); // Update displayed cards for new page
    }
  }

  // Navigates to the next page in the pagination
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedCards(); // Update displayed cards for new page
    }
  }

  // Updates the displayed cards based on current page
  updateDisplayedCards() {
    this.displayedCards = this.filteredCards.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  // Opens the edit modal for the selected business card
  openEditModal(card: any) {
    this.editedCard = { ...card }; // Copy selected card data for editing
    this.isEditModalOpen = true; // Set modal visibility to true
  }

  

  closeEditModal() {
    this.isEditModalOpen = false; // Close the modal
    this.editedCard = { // Reset edited card data to default values
        name: '',
        gender: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        address: ''
    };
}


  // Submits the edited business card data to the service
  submitEdit() {
    this.businessCardService.updateBusinessCard(this.editedCard).subscribe({
        next: (response) => {
            console.log('Business card updated successfully:', response);
            const index = this.businessCards.findIndex(card => card.email === this.editedCard.email);
            if (index !== -1) {
                this.businessCards[index] = { ...this.editedCard }; // Update card in the local array
            }
            alert('Business card updated successfully!'); // Success message
            this.closeEditModal(); // Close the modal
            this.filterCards(); // Reapply filtering to update displayed cards
        },
        error: (error) => {
            console.error('Error updating business card:', error);
            alert('Failed to update the business card. Please try again.'); // Error message
        }
    });
  }

  // Deletes a business card using the service
  deleteCard(card: any) {
    this.businessCardService.deleteBusinessCard(card.id).subscribe({
        next: (response) => {
            console.log('Business card deleted successfully:', response);
            this.businessCards = this.businessCards.filter(c => c.id !== card.id); // Remove card from local array
            this.filterCards(); // Reapply filtering to update displayed cards
            this.updateDisplayedCards(); // Update displayed cards after deletion
            alert('Business card deleted successfully!'); // Success message
        },
        error: (error) => {
            console.error('Error deleting business card:', error);
            alert('Failed to delete the business card. Please try again.'); // Error message
        }
    });
  }

  // Exports the selected business card in the chosen format
 // Exports the selected business card in the chosen format
 exportCards(card: any, exportFormat: string) {
  // Check if an export format has been selected
  if (!exportFormat) {
      alert('Please select an export format.'); // Alert if no format is selected
      return; // Exit the function if no format is selected
  }

  // Use the exportFormat property from the card
  const fileType = exportFormat === 'csv' ? 'text/csv' : 'application/xml'; // Determine the file type based on the selected format
  const fileName = `business_cards.${exportFormat}`; // Define the file name based on the export format
  let content = ''; // Initialize content for the file

  // Use the correct field containing the base64-encoded image
  const photoBase64 = card.photoBase64 ? card.photoBase64 : '';

  // Build the content based on the export format
  if (exportFormat === 'csv') {
      content += 'Name,Gender,DateOfBirth,Email,Phone,Address,Photo\n'; // CSV header
      content += `${card.name},${card.gender},${card.dateOfBirth},${card.email},${card.phone},${card.address},${photoBase64}\n`; // CSV data
  } else if (exportFormat === 'xml') {
      content += '<businessCards>\n'; // Start of XML
      content += `  <card>\n`; // Start of card entry
      content += `    <name>${card.name}</name>\n`; // Name field
      content += `    <gender>${card.gender}</gender>\n`; // Gender field
      content += `    <dateOfBirth>${card.dateOfBirth}</dateOfBirth>\n`; // Date of Birth field
      content += `    <email>${card.email}</email>\n`; // Email field
      content += `    <phone>${card.phone}</phone>\n`; // Phone field
      content += `    <address>${card.address}</address>\n`; // Address field
      content += `    <photo>${photoBase64}</photo>\n`;  // Base64-encoded photo field
      content += `  </card>\n`; // End of card entry
      content += '</businessCards>'; // End of XML
  }

  // Create a blob and initiate file download
  const blob = new Blob([content], { type: fileType }); // Create a new Blob with the content
  const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
  const a = document.createElement('a'); // Create a temporary anchor element
  a.href = url; // Set the href to the Blob URL
  a.download = fileName; // Set the download attribute with the file name
  a.click(); // Trigger the download
  window.URL.revokeObjectURL(url); // Clean up the URL
}



downloadXML() {
  this.businessCardService.exportBusinessCardsToXml().subscribe({
    next: (response: Blob) => {
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'BusinessCards.xml'); 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    error: (error) => {
      console.error('Error downloading XML file:', error);
    }
  });
}

downloadCSV() {
  this.businessCardService.exportBusinessCardsToCSV().subscribe({
    next: (response: Blob) => {
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'BusinessCards.csv'); 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    error: (error) => {
      console.error('Error downloading csv file:', error);
    }
  });
}


}
