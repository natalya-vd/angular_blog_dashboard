export interface Subscriber {
  name: string;
  email: string;
}

export interface SubscriberFromFirebase {
  id: string;
  data: Subscriber;
}
