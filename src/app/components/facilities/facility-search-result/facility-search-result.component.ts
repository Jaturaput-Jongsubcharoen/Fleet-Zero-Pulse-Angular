import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BusDetails, CategoryId } from '../../../data/fleet-store';

@Component({
  selector: 'app-facility-search-result',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './facility-search-result.component.html',
  styleUrl: './facility-search-result.component.scss',
})
export class FacilitySearchResultComponent {
  @Input() selectedFacilityLabel = '';
  @Input() searchDropListId = '';
  @Input() searchResults: BusDetails[] = [];
  @Input() searchMetaById: Record<
    string,
    { categoryId: CategoryId; categoryLabel: string } | undefined
  > = {};
  @Input() searchQuery = '';
  @Input() connectedDropListIds: string[] = [];
  @Input() busImageUrl = '';

  // we keep trackBy here locally
  trackByBusId = (_: number, bus: BusDetails) => bus.id;
}