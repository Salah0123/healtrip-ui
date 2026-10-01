import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import {
  ChatService,
  ChatResponse
} from '../../services/chat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent {

  // -------------------------
  // State
  // -------------------------

  conversationId = crypto.randomUUID();

  message = signal('');

  messages = signal<ChatMessage[]>([]);

  loading = signal(false);

  isArabic = signal(false);


  // -------------------------
  // Computed state
  // -------------------------

  direction = computed(() =>
    this.isArabic() ? 'rtl' : 'ltr'
  );


  constructor(
    private chatService: ChatService
  ) {}


  // -------------------------
  // Send message
  // -------------------------

  sendMessage(): void {

    const text = this.message().trim();

    if (!text || this.loading()) {
      return;
    }

    // Add user message
    this.messages.update(messages => [
      ...messages,
      {
        role: 'user',
        content: text
      }
    ]);

    // Clear input
    this.message.set('');

    // Start loading
    this.loading.set(true);

    this.chatService.sendMessage({
      conversationId: this.conversationId,
      message: text
    }).subscribe({

      next: (response: ChatResponse) => {

        this.messages.update(messages => [
          ...messages,
          {
            role: 'assistant',
            content: response.message
          }
        ]);

        this.loading.set(false);
      },

      error: (error) => {

        console.error(error);

        this.messages.update(messages => [
          ...messages,
          {
            role: 'assistant',
            content: this.isArabic()
              ? 'حدث خطأ أثناء الاتصال بالخادم.'
              : 'An error occurred while contacting the server.'
          }
        ]);

        this.loading.set(false);
      }
    });
  }


  // -------------------------
  // Keyboard handling
  // -------------------------

  handleKeydown(event: KeyboardEvent): void {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      this.sendMessage();
    }
  }


  // -------------------------
  // Language
  // -------------------------

  toggleLanguage(): void {

    this.isArabic.update(
      value => !value
    );
  }


  // -------------------------
  // Markdown
  // -------------------------

  renderMarkdown(content: string): string {

    const html = marked.parse(content, {
      breaks: true
    });

    return DOMPurify.sanitize(
      html as string
    );
  }
}