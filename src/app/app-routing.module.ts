import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {UsersComponent} from 'src/app/users/users.component';
import {RestaurantsComponent} from 'src/app/restaurants/restaurants.component';
import {AuthGuard} from 'src/app/auth.guard';

const routes: Routes = [{ path: '', redirectTo: 'restaurantDetails', pathMatch: 'full' },
                        { path: 'login', component: UsersComponent },
                        { path: 'restaurantDetails', canActivate: [AuthGuard], 
                          component:RestaurantsComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
