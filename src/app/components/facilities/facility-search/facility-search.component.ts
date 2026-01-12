import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facility-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facility-search.component.html',
  styleUrl: './facility-search.component.scss',
})
export class FacilitySearchComponent {
  /** Current text in the search box */
  @Input() query = '';

  /** Whether to show the Clear button */
  @Input() showClear = false;

  /** Emit when the input text changes */
  @Output() queryChange = new EventEmitter<string>();

  /** Emit when Clear is clicked */
  @Output() clear = new EventEmitter<void>();

  onInputChange(value: string) {
    this.queryChange.emit(value);
  }

  onClearClick() {
    this.clear.emit();
  }
}
