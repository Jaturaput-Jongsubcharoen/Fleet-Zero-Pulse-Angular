import { Routes } from '@angular/router';
import { VehicleManagementComponent } from './components/vehicle-management/vehicle-management.component';
import { StationComponent } from './components/station/station.component';

export const routes: Routes = [
  { path: '', component: VehicleManagementComponent },
  { path: 'station/:facilityId', component: StationComponent },
];
