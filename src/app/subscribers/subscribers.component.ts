import { Component, OnInit } from '@angular/core';
import { SubscriberService } from '../services/subscriber/subscriber.service';
import { SubscriberFromFirebase } from '../models/subscriber';

@Component({
  selector: 'app-subscribers',
  templateUrl: './subscribers.component.html',
  styleUrls: ['./subscribers.component.css'],
})
export class SubscribersComponent implements OnInit {
  subscribers!: SubscriberFromFirebase[];

  constructor(private subService: SubscriberService) {}

  ngOnInit(): void {
    this.subService.getSubscribersList().subscribe(value => {
      this.subscribers = value;
    });
  }

  onDelete(id: string) {
    const isDelete = confirm('Do you want to delete subscriber?');

    if (isDelete) {
      this.subService.deleteData(id);
    }
  }
}
