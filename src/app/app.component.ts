import { Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListBusinessCardsComponent } from './list-business-cards/list-business-cards.component';
import { AddBusinessCardComponent } from './add-business-card/add-business-card.component';
import { NavbarComponent } from './navbar/navbar.component';


const routes: Routes = [
  { path: '', redirectTo: 'list-cards', pathMatch: 'full' },
  { path: 'list-cards', component: ListBusinessCardsComponent },
  { path: 'add-card', component: AddBusinessCardComponent }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavbarComponent, ], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Business-Cards';

}
