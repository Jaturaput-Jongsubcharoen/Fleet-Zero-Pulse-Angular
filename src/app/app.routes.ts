import { Routes } from '@angular/router';
import { VehicleManagementComponent } from './pages/vehicle-management/vehicle-management.component';
import { StationComponent } from './pages/station/station.component';

export const routes: Routes = [
  { path: '', component: VehicleManagementComponent },
  { path: 'station/:facilityId', component: StationComponent },
];
