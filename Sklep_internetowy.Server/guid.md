# Instrukcja Konfiguracji Projektu (Docker & Migracje)

Ten dokument opisuje standardowe procedury pracy z projektem, w tym tworzenie nowych migracji bazy danych oraz codzienne uruchamianie środowiska deweloperskiego.

---

## ## Jak Dodać Nową Migrację (np. dodać kolumnę do tabeli)

To jest proces, który wykonujesz **TY**, gdy zmieniasz strukturę bazy danych (np. dodajesz nową tabelę lub kolumnę).

1.  **Zmień Modele C#:** Zanim zaczniesz, dokonaj zmian w swoich modelach C# (np. dodaj `public string NewProperty { get; set; }` do klasy `Product.cs`).

2.  **Uruchom Kontenery:** W Visual Studio, upewnij się, że jako "Startup Project" wybrany jest `docker-compose`. Naciśnij **`Ctrl + F5`** (Start Without Debugging), aby uruchomić kontenery (backend i bazę danych).

3.  **Zmień Connection String (Tymczasowo):** Otwórz plik `appsettings.json` (w projekcie `.Server`). Zmień `Server=db` na `Server=localhost`.
    * *(To jest "most", aby Visual Studio mogło zobaczyć bazę danych, która działa w Dockerze).*

4.  **Zmień Ustawienia Projektu:**
    * W Visual Studio, zmień "Startup Project" (na górnym pasku obok "Play") na `Sklep_internetowy.Server`.
    * W konsoli `Package Manager Console` (na dole), w polu `Default project`, również wybierz `Sklep_internetowy.Server`.

5.  **Dodaj Migrację:** W `Package Manager Console` wpisz:
    ```powershell
    Add-Migration TwojaNazwaMigracji (np. AddIsAdminToUser)
    ```

6.  **Zaktualizuj Bazę Danych:** W `Package Manager Console` wpisz:
    ```powershell
    Update-Database
    ```
    *(Poczekaj na komunikat `Done.`)*

7.  ** PRZYWRÓĆ USTAWIENIA! (Najważniejsze):**
    * Wróć do `appsettings.json` i zmień `Server=localhost` z powrotem na `Server=db`.
    * Wróć do "Startup Project" (na górnym pasku) i zmień go z powrotem na `docker-compose`.

8.  **Zrób Commit:** Teraz zrób `git commit` i `git push`. Twoi koledzy z zespołu otrzymają nowy plik migracji, który będą musieli tylko u siebie zastosować (patrz następna sekcja).

---

## ## Jak Zastosować Nową Migrację (dla reszty zespołu)

To jest proces, który wykonuje **KAŻDY** członek zespołu, gdy pobierze z GitHuba nową migrację (stworzoną przez kogoś innego).

1.  **Zrób `git pull`**, aby pobrać najnowsze zmiany (w tym nowy plik migracji).
2.  Wykonaj kroki **2, 3, 4** oraz **6** z instrukcji "Jak Dodać Nową Migrację".
3.  **Nie musisz** uruchamiać `Add-Migration`. Musisz tylko uruchomić `Update-Database`.
4.  Pamiętaj, aby na końcu **przywrócić ustawienia** (krok 7).

---

## ## Jak Uruchomić Cały Projekt (Backend + Baza + Frontend)

To jest proces, który wykonujesz **codziennie**, aby uruchomić projekt do pracy.

#### 1. Uruchom Backend i Bazę Danych:
1.  W Visual Studio upewnij się, że "Startup Project" (na górze) to `docker-compose`.
2.  Naciśnij **`Ctrl + F5`** (Start Without Debugging).
3.  Otworzy się przeglądarka ze Swaggerem (np. `localhost:8080`). **Zostaw to włączone.**

#### 2. Uruchom Frontend:
4.  Otwórz **nowy, osobny** terminal (np. `View -> Terminal` w Visual Studio).
5.  Jeśli używasz **PowerShell**, wpisz tę komendę, aby zezwolić na skrypty (musisz to robić za każdym razem, gdy otwierasz nowy terminal):
    ```powershell
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    ```
6.  Upewnij się, że jesteś w głównym folderze projektu (np. `D:\ProjectZespolowy\Sklep_internetowy`, tam gdzie jest `package.json`).
7.  Wpisz komendę:
    ```bash
    npm run dev
    ```
8.  Otwórz w przeglądarce adres, który poda Ci Vite (np. `http://localhost:5173`).