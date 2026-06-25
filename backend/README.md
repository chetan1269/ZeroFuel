# ZeroFuel Backend API (Spring Boot)

Welcome to the backend of ZeroFuel! Since you are familiar with Java but new to Spring Boot, this guide is written specifically for you. It explains the architecture, the "magic" behind the framework, and how the code flows from a mobile app request down to the database.

---

## 1. WHAT is this project?
This is a **RESTful API backend** built with **Java 21** and **Spring Boot 3**.
In pure Java, building a web server requires handling raw sockets, HTTP parsing, threads, and manual database connections (JDBC). 
Spring Boot is a framework that **auto-configures** all of this for you. It comes with an embedded web server (Tomcat), so instead of deploying your code to a separate server, you just run `public static void main` and the server starts automatically.

---

## 2. WHY use Spring Boot and this Architecture?
* **Why Spring Boot?** It removes boilerplate. You don't write SQL queries manually; you just define Java interfaces. You don't manually map JSON to Java Objects; Spring does it automatically using Jackson.
* **Why N-Tier Architecture (Controller -> Service -> Repository)?** It separates concerns. If you want to change the database from MySQL to PostgreSQL, you only touch the Repository layer. If you want to change from a Mobile API to a Web API, you only touch the Controller layer.

---

## 3. HOW does it work? (A Dry Run)

Let's do a **Dry Run** of what happens when a user opens the app and requests an OTP to log in: `POST /api/v1/auth/send-otp`

1. **The Request:** The React Native mobile app sends a JSON payload: `{"phoneNumber": "+919876543210"}`.
2. **The Dispatcher:** Spring's hidden `DispatcherServlet` receives the raw HTTP request, looks at the URL `/api/v1/auth/send-otp`, and finds the Java method mapped to it.
3. **The Controller (`AuthController.java`):**
   - The method `sendOtp(@RequestBody SendOtpRequest request)` is triggered.
   - Spring automatically converts the incoming JSON string into your `SendOtpRequest` Java object.
   - The `@Valid` annotation checks if the phone number matches your Regex pattern. If it fails, Spring immediately returns a `400 Bad Request` without executing your code.
   - The Controller calls `authService.sendOtp(request)`.
4. **The Service (`AuthServiceImpl.java`):**
   - This is where your **Business Logic** lives. 
   - It invalidates any old OTPs for that number.
   - It generates a new OTP (`"123456"` for MVP).
   - It creates a new `OtpVerification` Java object.
   - It calls `otpVerificationRepository.save(otpVerification)`.
5. **The Repository (`OtpVerificationRepository.java`):**
   - This is just an interface, but Spring generates the implementation dynamically.
   - It converts the `.save()` call into a SQL `INSERT INTO otp_verifications ...` query and executes it against MySQL.
6. **The Response:** 
   - The Controller returns an `ApiResponse` object. 
   - Spring automatically converts this Java object back into JSON: `{"message": "OTP sent successfully"}` and sends it back to the mobile app with a `200 OK` status.

---

## 4. Design Patterns Used

### A. Dependency Injection / Inversion of Control (IoC)
* **What:** Instead of you writing `new AuthServiceImpl()` and `new OtpVerificationRepository()`, Spring creates these objects (called "Beans") when the application starts and hands them to you.
* **How:** We use Constructor Injection. Look at `AuthServiceImpl`—it has `private final UserRepository userRepository;`. We don't instantiate it. The `@RequiredArgsConstructor` (from Lombok) generates a constructor, and Spring automatically passes the `UserRepository` into it.

### B. MVC / Layered Pattern
* **What:** Separating the application into Layers.
* **How:** 
  - **Controllers:** Handle HTTP and JSON (Web Layer).
  - **Services:** Handle rules, math, and business logic (Business Layer).
  - **Repositories:** Handle database SQL (Data Layer).

### C. DTO (Data Transfer Object) Pattern
* **What:** Never returning your database `Entity` (like `User`) directly to the frontend if it contains sensitive data (like passwords) or infinite loops (like User -> Bookings -> User).
* **How:** We created `SendOtpRequest` and `AuthResponse`. These are simple Java classes whose only job is to carry data between the client and the server.

### D. Builder Pattern
* **What:** A clean way to construct complex objects without massive constructors.
* **How:** Using Lombok's `@Builder`. Instead of `new User(null, "phone", null, null, ...)`, we write:
  ```java
  User.builder()
      .phoneNumber("123")
      .status(UserStatus.PENDING_KYC)
      .build();
  ```

---

## 5. Annotation Significance (The "Magic" Glossary)

If you see an `@Annotation`, it is usually telling Spring or Lombok to generate code for you behind the scenes.

### Spring Stereotypes (Component Scanning)
* `@RestController`: Tells Spring "This class handles web requests and returns JSON."
* `@Service`: Tells Spring "This class holds business logic. Create one instance of it (Singleton) and let other classes use it."
* `@Repository`: Tells Spring "This interface talks to the database."

### Web Mapping
* `@RequestMapping("/api/v1/auth")`: Any HTTP request starting with this URL goes to this class.
* `@PostMapping("/send-otp")`: Maps a POST request to a specific method.
* `@RequestBody`: Tells Spring to read the HTTP request body and parse the JSON into a Java object.
* `@PathVariable`: Extracts values from the URL (e.g., `/bikes/{id}` -> extracts `id`).

### Database / JPA (Hibernate)
* `@Entity`: Tells Hibernate "This Java class maps to a table in the database."
* `@Table(name = "users")`: Specifies the exact table name in MySQL.
* `@Id` & `@GeneratedValue`: Marks the primary key and tells MySQL to auto-increment it.
* `@Column`: Maps a Java variable to a specific SQL column.
* `@OneToMany` / `@ManyToOne`: Defines SQL Foreign Key relationships (e.g., One User has Many Bookings).
* `@Transactional`: Wrap this method in a DB transaction. If any exception is thrown, rollback all database changes automatically.

### Lombok (Boilerplate Reducer)
* `@Data`: Generates Getters, Setters, `toString()`, `equals()`, and `hashCode()` at compile time. You don't see them in the code, but they exist in the compiled `.class` file.
* `@RequiredArgsConstructor`: Generates a constructor for all `final` variables. (This is how Spring injects dependencies).
* `@Builder`: Generates the Builder pattern for the class.
* `@Slf4j`: Automatically gives you a `log` variable so you can write `log.info("Hello");` instead of `System.out.println`.

### Validation
* `@Valid`: Tells Spring to validate the incoming request object before running the method.
* `@NotBlank`, `@NotNull`: Validation rules. If a field is null, Spring throws an error automatically.
