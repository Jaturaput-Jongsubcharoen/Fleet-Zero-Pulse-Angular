import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

type SnapshotBus = {
  id: string;
  label: string;
  facilityId?: string;
  statusLabel?: string;
  batteryPct?: number | null;
  alerts?: string[] | null;
};

@Component({
  selector: 'app-bus-snapshot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bus-snapshot.component.html',
  styleUrl: './bus-snapshot.component.scss',
})
export class BusSnapshotComponent implements AfterViewInit {
  @Input({ required: true }) bus!: SnapshotBus;

  // configurable UI text (with defaults)
  @Input() title = 'Bus Pop-up';
  @Input() facilityLabel = 'Facility';
  @Input() statusLabel = 'Status';
  @Input() batteryLabel = 'Battery';
  @Input() alertsLabel = 'Alerts';
  @Input() closeLabel = 'Close';
  @Input() viewFullLabel = 'View Full Details';

  @Output() close = new EventEmitter<void>();
  @Output() viewFull = new EventEmitter<string>();

  isVisible = false; // for enter animation
  isClosing = false; // for exit animation

  ngAfterViewInit(): void {
    // Next frame => triggers transition from hidden -> visible
    requestAnimationFrame(() => {
      this.isVisible = true;
    });
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.startClose();
  }

  onBackdropClick() {
    this.startClose();
  }

  onCloseClick() {
    this.startClose();
  }

  startClose() {
    if (this.isClosing) return;
    this.isClosing = true;
    this.isVisible = false; // animate out

    setTimeout(() => {
      this.close.emit();
    }, 200); // match CSS transition duration
  }

  onViewFullClick() {
    this.viewFull.emit(this.bus.id);
  }

  stop(e: MouseEvent) {
    e.stopPropagation();
  }

  batteryText() {
    if (this.bus.batteryPct === null || this.bus.batteryPct === undefined) {
      return '—%';
    }
    return `${this.bus.batteryPct}%`;
  }

  alertsText() {
    const a = this.bus.alerts ?? [];
    return a.length ? a.join(', ') : 'None';
  }
}
