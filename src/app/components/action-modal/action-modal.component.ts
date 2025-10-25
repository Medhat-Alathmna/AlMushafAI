import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './action-modal.component.html',
  styleUrls: ['./action-modal.component.scss']
})
export class ActionModalComponent {
  @Input() title = '';
  @Input() body = '';
  @Output() dismiss = new EventEmitter<void>();
}

