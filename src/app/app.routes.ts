import { Routes } from '@angular/router';
import { ListBusinessCardsComponent } from './list-business-cards/list-business-cards.component';
import { AddBusinessCardComponent } from './add-business-card/add-business-card.component';


export const routes: Routes = [
  { path: '', redirectTo: 'list-cards', pathMatch: 'full' },
  { path: 'list-cards', component: ListBusinessCardsComponent },
  { path: 'add-card', component: AddBusinessCardComponent }
];
