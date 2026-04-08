class Ticket {
  constructor(
    id,
    title,
    category,
    priority,
    author,
    room,
    description,
    status = "Nowe",
    createdAt = new Date().toLocaleString("pl-PL")
  ) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.priority = priority;
    this.author = author;
    this.room = room;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt;
  }
}

class HelpDeskApp {
  constructor() {
    this.tickets = [];
    this.storageKey = "sevdeskpro_tickets";

    this.form = document.getElementById("ticketForm");
    this.titleInput = document.getElementById("title");
    this.categoryInput = document.getElementById("category");
    this.priorityInput = document.getElementById("priority");
    this.authorInput = document.getElementById("author");
    this.roomInput = document.getElementById("room");
    this.descriptionInput = document.getElementById("description");
    this.formError = document.getElementById("formError");

    this.searchInput = document.getElementById("searchInput");
    this.statusFilter = document.getElementById("statusFilter");
    this.priorityFilter = document.getElementById("priorityFilter");
    this.ticketsList = document.getElementById("ticketsList");
    this.clearAllBtn = document.getElementById("clearAllBtn");
    this.loadDemoBtn = document.getElementById("loadDemoBtn");

    this.allCount = document.getElementById("allCount");
    this.openCount = document.getElementById("openCount");
    this.progressCount = document.getElementById("progressCount");
    this.closedCount = document.getElementById("closedCount");

    this.init();
  }

  init() {
    this.loadTickets();
    this.renderTickets();
    this.updateStats();
    this.bindEvents();
    this.highlightNav();
  }

  bindEvents() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.addTicket();
    });

    this.searchInput.addEventListener("input", () => this.renderTickets());
    this.statusFilter.addEventListener("change", () => this.renderTickets());
    this.priorityFilter.addEventListener("change", () => this.renderTickets());

    this.clearAllBtn.addEventListener("click", () => {
      if (confirm("Na pewno usunąć wszystkie zgłoszenia?")) {
        this.tickets = [];
        this.saveTickets();
        this.renderTickets();
        this.updateStats();
      }
    });

    this.loadDemoBtn.addEventListener("click", () => this.loadDemoData());
  }

  validateForm() {
    const title = this.titleInput.value.trim();
    const author = this.authorInput.value.trim();
    const room = this.roomInput.value.trim();
    const description = this.descriptionInput.value.trim();

    if (!title || !author || !room || !description) {
      return "Uzupełnij wszystkie pola formularza.";
    }

    if (title.length < 5) {
      return "Tytuł zgłoszenia musi mieć minimum 5 znaków.";
    }

    if (description.length < 12) {
      return "Opis problemu musi mieć minimum 12 znaków.";
    }

    return "";
  }

  addTicket() {
    const validationMessage = this.validateForm();
    this.formError.textContent = validationMessage;

    if (validationMessage) {
      return;
    }

    const newTicket = new Ticket(
      Date.now(),
      this.titleInput.value.trim(),
      this.categoryInput.value,
      this.priorityInput.value,
      this.authorInput.value.trim(),
      this.roomInput.value.trim(),
      this.descriptionInput.value.trim()
    );

    this.tickets.unshift(newTicket);
    this.saveTickets();
    this.renderTickets();
    this.updateStats();
    this.form.reset();
    this.formError.textContent = "";
  }

  saveTickets() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tickets));
  }

  loadTickets() {
    const storedTickets = localStorage.getItem(this.storageKey);
    if (storedTickets) {
      this.tickets = JSON.parse(storedTickets);
    }
  }

  getFilteredTickets() {
    const searchPhrase = this.searchInput.value.toLowerCase().trim();
    const selectedStatus = this.statusFilter.value;
    const selectedPriority = this.priorityFilter.value;

    return this.tickets.filter((ticket) => {
      const matchesText =
        ticket.title.toLowerCase().includes(searchPhrase) ||
        ticket.author.toLowerCase().includes(searchPhrase) ||
        ticket.category.toLowerCase().includes(searchPhrase);

      const matchesStatus =
        selectedStatus === "Wszystkie" || ticket.status === selectedStatus;

      const matchesPriority =
        selectedPriority === "Wszystkie" || ticket.priority === selectedPriority;

      return matchesText && matchesStatus && matchesPriority;
    });
  }

  updateTicketStatus(id) {
    this.tickets = this.tickets.map((ticket) => {
      if (ticket.id === id) {
        if (ticket.status === "Nowe") {
          ticket.status = "W trakcie";
        } else if (ticket.status === "W trakcie") {
          ticket.status = "Zamknięte";
        } else {
          ticket.status = "Nowe";
        }
      }
      return ticket;
    });

    this.saveTickets();
    this.renderTickets();
    this.updateStats();
  }

  deleteTicket(id) {
    this.tickets = this.tickets.filter((ticket) => ticket.id !== id);
    this.saveTickets();
    this.renderTickets();
    this.updateStats();
  }

  getPriorityClass(priority) {
    if (priority === "Niski") return "priority-niski";
    if (priority === "Średni") return "priority-sredni";
    return "priority-wysoki";
  }

  getStatusClass(status) {
    if (status === "Nowe") return "status-nowe";
    if (status === "W trakcie") return "status-wtrakcie";
    return "status-zamkniete";
  }

  renderTickets() {
    this.ticketsList.innerHTML = "";
    const filteredTickets = this.getFilteredTickets();

    if (filteredTickets.length === 0) {
      this.ticketsList.innerHTML = `
        <div class="empty-state">
          <h4>Brak pasujących zgłoszeń</h4>
          <p>Dodaj nowe zgłoszenie albo zmień filtry wyszukiwania.</p>
        </div>
      `;
      return;
    }

    filteredTickets.forEach((ticket) => {
      const card = document.createElement("article");
      card.className = "ticket-card";

      card.innerHTML = `
        <div class="ticket-top">
          <div>
            <div class="ticket-title">${ticket.title}</div>
            <div class="ticket-meta">
              ID: #${ticket.id} • Autor: ${ticket.author} • Lokalizacja: ${ticket.room}<br>
              Kategoria: ${ticket.category} • Dodano: ${ticket.createdAt}
            </div>
          </div>
          <span class="status-pill ${this.getStatusClass(ticket.status)}">${ticket.status}</span>
        </div>

        <div class="ticket-desc">${ticket.description}</div>

        <div class="ticket-bottom">
          <div class="tags">
            <span class="tag ${this.getPriorityClass(ticket.priority)}">Priorytet: ${ticket.priority}</span>
            <span class="tag btn-ghost">${ticket.category}</span>
          </div>

          <div class="actions">
            <button class="small-btn btn-ghost status-btn" data-id="${ticket.id}">Zmień status</button>
            <button class="small-btn btn-danger delete-btn" data-id="${ticket.id}">Usuń</button>
          </div>
        </div>
      `;

      this.ticketsList.appendChild(card);
    });

    const statusButtons = document.getElementsByClassName("status-btn");
    const deleteButtons = document.getElementsByClassName("delete-btn");

    for (const button of statusButtons) {
      button.addEventListener("click", () => {
        this.updateTicketStatus(Number(button.dataset.id));
      });
    }

    for (const button of deleteButtons) {
      button.addEventListener("click", () => {
        this.deleteTicket(Number(button.dataset.id));
      });
    }
  }

  updateStats() {
    const all = this.tickets.length;
    const open = this.tickets.filter((ticket) => ticket.status === "Nowe").length;
    const progress = this.tickets.filter((ticket) => ticket.status === "W trakcie").length;
    const closed = this.tickets.filter((ticket) => ticket.status === "Zamknięte").length;

    this.allCount.textContent = all;
    this.openCount.textContent = open;
    this.progressCount.textContent = progress;
    this.closedCount.textContent = closed;
  }

  loadDemoData() {
    if (this.tickets.length > 0 && !confirm("Masz już zapisane zgłoszenia. Nadpisać je danymi demo?")) {
      return;
    }

    this.tickets = [
      new Ticket(
        Date.now() + 1,
        "Brak połączenia z Wi-Fi",
        "Sieć",
        "Wysoki",
        "Jan Nowak",
        "Sala 105",
        "Komputery w sali nie łączą się z siecią szkolną.",
        "Nowe"
      ),
      new Ticket(
        Date.now() + 2,
        "Nie działa drukarka",
        "Sprzęt",
        "Średni",
        "Anna Kowalska",
        "Sekretariat",
        "Drukarka zgłasza błąd papieru mimo poprawnego załadowania.",
        "W trakcie"
      ),
      new Ticket(
        Date.now() + 3,
        "Reset hasła do konta",
        "Konto użytkownika",
        "Niski",
        "Michał Zieliński",
        "Pracownia 2",
        "Uczeń nie pamięta hasła do konta i nie może się zalogować.",
        "Zamknięte"
      )
    ];

    this.saveTickets();
    this.renderTickets();
    this.updateStats();
  }

  highlightNav() {
    const firstNavLink = document.querySelector("nav a");
    if (firstNavLink) {
      firstNavLink.style.background = "#20242d";
      firstNavLink.style.color = "#f1f3f5";
    }
  }
}

const app = new HelpDeskApp();
