import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ai-reader',
  templateUrl: './ai-reader.page.html',
  styleUrls: ['./ai-reader.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AiReaderPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
