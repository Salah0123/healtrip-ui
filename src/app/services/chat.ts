import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatRequest {
  conversationId: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(
    request: ChatRequest
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      this.apiUrl,
      request
    );
  }
}
