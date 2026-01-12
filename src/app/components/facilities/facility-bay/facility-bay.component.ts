import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facility-bay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facility-bay.component.html',
  styleUrls: ['./facility-bay.component.scss'],
})
export class FacilityBayComponent {
  @Input() isVisible = false;
  @Input() bayOptions: number[] = [];
  @Input() baySelected: number | null = null;
  @Input() bayErrorMsg = '';

  @Output() baySelectedChange = new EventEmitter<number | null>();
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBayChange(value: number | null) {
    this.baySelectedChange.emit(value);
  }

  onCancelClick() {
    this.cancel.emit();
  }

  onConfirmClick() {
    this.confirm.emit();
  }
}