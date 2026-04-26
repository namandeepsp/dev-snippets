import type { SnippetTemplate } from './snippet.templates'

export const JAVA_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'Generic Result Wrapper',
		description:
			'Result wrapper for success/failure flows. Usage: Result<User> userResult = Result.success(user);',
		code: `public class Result<T> {
    private final T data;
    private final String error;
    private final boolean success;

    private Result(T data, String error, boolean success) {
        this.data = data;
        this.error = error;
        this.success = success;
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(data, null, true);
    }

    public static <T> Result<T> failure(String error) {
        return new Result<>(null, error, false);
    }

    public T orElseThrow() throws Exception {
        if (!success) throw new Exception(error);
        return data;
    }

    public Optional<T> getData() { return Optional.ofNullable(data); }
    public Optional<String> getError() { return Optional.ofNullable(error); }
    public boolean isSuccess() { return success; }
}

// Usage: Result<User> userResult = Result.success(user);`,
		language: 'java',
		technologies: ['java'],
		categories: ['types', 'utilities'],
	},
	{
		title: 'Try-With-Resources Custom Resource',
		description:
			'Custom AutoCloseable wrapper for DB connections. Usage: try (DatabaseConnection conn = new DatabaseConnection(url, user, pass)) { ... }',
		code: `public class DatabaseConnection implements AutoCloseable {
    private Connection connection;
    private boolean closed = false;

    public DatabaseConnection(String url, String user, String password)
            throws SQLException {
        this.connection = DriverManager.getConnection(url, user, password);
    }

    public PreparedStatement prepareStatement(String sql) throws SQLException {
        if (closed) throw new SQLException("Connection already closed");
        return connection.prepareStatement(sql);
    }

    @Override
    public void close() throws SQLException {
        if (!closed && connection != null) {
            closed = true;
            connection.close();
        }
    }

    // Usage: try (DatabaseConnection conn = new DatabaseConnection(url, user, pass))
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['database', 'utilities'],
	},
	{
		title: 'Singleton with Enum',
		description:
			'Singleton using enum with HikariCP connection pool. Usage: Connection conn = DatabasePool.INSTANCE.getConnection();',
		code: `public enum DatabasePool {
    INSTANCE;

    private final HikariDataSource dataSource;

    DatabasePool() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        config.setMaximumPoolSize(10);
        this.dataSource = new HikariDataSource(config);
    }

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}

// Usage: Connection conn = DatabasePool.INSTANCE.getConnection();`,
		language: 'java',
		technologies: ['java'],
		categories: ['architecture', 'backend'],
	},
	{
		title: 'Builder Pattern with Lombok',
		description:
			'Lombok builder with validation. Usage: EmailMessage.builder().from("a").to("b").build().validate().send();',
		code: `import lombok.Builder;
import lombok.Singular;
import java.util.List;

@Builder
public class EmailMessage {
    private final String from;
    private final String to;
    private final String subject;
    private final String body;

    @Singular
    private final List<String> attachments;

    public static class EmailMessageBuilder {
        public EmailMessageBuilder validate() {
            if (to == null || to.isEmpty()) {
                throw new IllegalStateException("Recipient is required");
            }
            return this;
        }
    }

    public void send() {
        EmailMessageBuilder.builder()
            .from("noreply@example.com")
            .to("user@example.com")
            .subject("Hello")
            .body("Content")
            .attachment("file1.pdf")
            .build()
            .validate()
            .send();
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['utilities', 'architecture'],
	},
	{
		title: 'Custom Annotation for Validation',
		description:
			'Custom annotation and reflection-based validator. Usage: class User { @MinLength(3) String name; }',
		code: `@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MinLength {
    int value() default 1;
    String message() default "Field too short";
}

public class Validator {
    public static void validate(Object obj) throws IllegalAccessException {
        for (Field field : obj.getClass().getDeclaredFields()) {
            field.setAccessible(true);

            MinLength minLength = field.getAnnotation(MinLength.class);
            if (minLength != null) {
                String value = (String) field.get(obj);
                if (value == null || value.length() < minLength.value()) {
                    throw new ValidationException(minLength.message());
                }
            }
        }
    }
}

// Usage:
// class User { @MinLength(3) String name; }`,
		language: 'java',
		technologies: ['java'],
		categories: ['validation', 'utilities'],
	},
	{
		title: 'CompletableFuture Timeout Pattern',
		description:
			'Apply timeout to CompletableFuture. Usage: withTimeout(future, 5, TimeUnit.SECONDS)',
		code: `public class AsyncUtils {
    public static <T> CompletableFuture<T> withTimeout(
            CompletableFuture<T> future,
            long timeout,
            TimeUnit unit) {

        CompletableFuture<T> timeoutFuture = new CompletableFuture<>();
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        scheduler.schedule(() -> {
            timeoutFuture.completeExceptionally(
                new TimeoutException("Operation timed out")
            );
        }, timeout, unit);

        return future.applyToEither(timeoutFuture, Function.identity());
    }

    // Usage:
    // CompletableFuture<String> future = asyncCall();
    // CompletableFuture<String> withTimeout = withTimeout(future, 5, TimeUnit.SECONDS);
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['performance', 'utilities'],
	},
	{
		title: 'Circuit Breaker Pattern',
		description:
			'Simple circuit breaker with CLOSED/OPEN/HALF_OPEN. Usage: breaker.execute(() -> service.call())',
		code: `public class CircuitBreaker {
    private final int failureThreshold;
    private final long timeout;
    private int failureCount = 0;
    private long lastFailureTime = 0;
    private State state = State.CLOSED;

    enum State { CLOSED, OPEN, HALF_OPEN }

    public CircuitBreaker(int failureThreshold, long timeout) {
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
    }

    public synchronized <T> T execute(Supplier<T> supplier) {
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - lastFailureTime > timeout) {
                state = State.HALF_OPEN;
            } else {
                throw new RuntimeException("Circuit breaker is OPEN");
            }
        }

        try {
            T result = supplier.get();
            if (state == State.HALF_OPEN) {
                state = State.CLOSED;
                failureCount = 0;
            }
            return result;
        } catch (Exception e) {
            failureCount++;
            lastFailureTime = System.currentTimeMillis();

            if (failureCount >= failureThreshold) {
                state = State.OPEN;
            }
            throw e;
        }
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['architecture', 'backend'],
	},
	{
		title: 'Thread Pool with Virtual Threads (Java 21+)',
		description:
			'Virtual thread executor for high concurrency. Usage: pool.submit(() -> doWork())',
		code: `import java.util.concurrent.*;

public class VirtualThreadPool {
    private final ExecutorService executor;

    public VirtualThreadPool(int maxThreads) {
        this.executor = Executors.newThreadPerTaskExecutor(
            Thread.ofVirtual().name("virtual-", 0).factory()
        );
    }

    public CompletableFuture<Void> submit(Runnable task) {
        return CompletableFuture.runAsync(task, executor);
    }

    public <T> List<CompletableFuture<T>> submitAll(List<Callable<T>> tasks) {
        return tasks.stream()
            .map(task -> CompletableFuture.supplyAsync(() -> {
                try { return task.call(); }
                catch (Exception e) { throw new RuntimeException(e); }
            }, executor))
            .collect(Collectors.toList());
    }

    public void shutdown() {
        executor.shutdown();
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['performance', 'backend'],
	},
	{
		title: 'Rate Limiter with Semaphore',
		description:
			'Semaphore-based rate limiter. Usage: limiter.tryAcquire() or limiter.acquire()',
		code: `public class RateLimiter {
    private final Semaphore semaphore;
    private final int maxPermits;
    private final ScheduledExecutorService scheduler;

    public RateLimiter(int permitsPerSecond) {
        this.maxPermits = permitsPerSecond;
        this.semaphore = new Semaphore(permitsPerSecond);
        this.scheduler = Executors.newScheduledThreadPool(1);

        scheduler.scheduleAtFixedRate(() -> {
            semaphore.release(maxPermits - semaphore.availablePermits());
        }, 1, 1, TimeUnit.SECONDS);
    }

    public boolean tryAcquire() {
        return semaphore.tryAcquire();
    }

    public void acquire() throws InterruptedException {
        semaphore.acquire();
    }

    public void shutdown() {
        scheduler.shutdown();
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['performance', 'security'],
	},
	{
		title: 'Cache with Expiry',
		description:
			'Concurrent cache with TTL. Usage: cache.getOrCompute(key, computeFn)',
		code: `public class ExpiringCache<K, V> {
    private final Map<K, CacheEntry<V>> cache = new ConcurrentHashMap<>();
    private final long ttlMillis;

    private record CacheEntry<V>(V value, long expiryTime) {}

    public ExpiringCache(long ttl, TimeUnit unit) {
        this.ttlMillis = unit.toMillis(ttl);
    }

    public V get(K key) {
        CacheEntry<V> entry = cache.get(key);
        if (entry == null) return null;

        if (System.currentTimeMillis() > entry.expiryTime()) {
            cache.remove(key);
            return null;
        }
        return entry.value();
    }

    public void put(K key, V value) {
        cache.put(key, new CacheEntry<>(
            value,
            System.currentTimeMillis() + ttlMillis
        ));
    }

    public V getOrCompute(K key, Function<K, V> compute) {
        V value = get(key);
        if (value != null) return value;

        value = compute.apply(key);
        put(key, value);
        return value;
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['data', 'performance'],
	},
	{
		title: 'Generic Repository with JPA',
		description:
			'BaseRepository with common JPA helpers. Usage: interface UserRepository extends BaseRepository<User, Long> { ... }',
		code: `import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import java.io.Serializable;
import java.util.List;
import java.util.Optional;

@NoRepositoryBean
public interface BaseRepository<T, ID extends Serializable>
        extends JpaRepository<T, ID> {

    Optional<T> findById(ID id);

    default T findByIdOrThrow(ID id) {
        return findById(id)
            .orElseThrow(() -> new EntityNotFoundException(
                "Entity not found with id: " + id
            ));
    }

    List<T> findAllById(Iterable<ID> ids);

    <S extends T> S save(S entity);

    void deleteById(ID id);

    default Page<T> findAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return findAll(pageable);
    }

    default List<T> saveAllAndFlush(Iterable<T> entities) {
        List<T> saved = saveAll(entities);
        flush();
        return saved;
    }
}

@Repository
public interface UserRepository extends BaseRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    @Modifying
    @Query("UPDATE User u SET u.active = :active WHERE u.id = :id")
    int updateActiveStatus(@Param("id") Long id, @Param("active") boolean active);

    @EntityGraph(attributePaths = {"roles", "permissions"})
    Optional<User> findWithRolesById(Long id);
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['database', 'backend'],
	},
	{
		title: 'Event-Driven Architecture with Spring',
		description:
			'Spring events with async and transactional listeners. Usage: publisher.publishUserCreated(userId, email)',
		code: `import org.springframework.context.ApplicationEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import java.time.Instant;

public class UserCreatedEvent extends ApplicationEvent {
    private final Long userId;
    private final String email;
    private final Instant timestamp;

    public UserCreatedEvent(Object source, Long userId, String email) {
        super(source);
        this.userId = userId;
        this.email = email;
        this.timestamp = Instant.now();
    }

    // Getters
}

@Component
public class UserEventPublisher {
    @Autowired
    private ApplicationEventPublisher publisher;

    public void publishUserCreated(Long userId, String email) {
        UserCreatedEvent event = new UserCreatedEvent(this, userId, email);
        publisher.publishEvent(event);
    }

    public void publishUserUpdated(Long userId, Map<String, Object> changes) {
        UserUpdatedEvent event = new UserUpdatedEvent(this, userId, changes);
        publisher.publishEvent(event);
    }
}

@Component
public class UserEventListeners {

    @EventListener
    @Async
    public void handleUserCreated(UserCreatedEvent event) {
        emailService.sendWelcomeEmail(event.getEmail());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserUpdated(UserUpdatedEvent event) {
        cacheService.invalidateUser(event.getUserId());
    }

    @EventListener(condition = "#event.changes['role'] != null")
    public void handleRoleChange(UserUpdatedEvent event) {
        auditService.logRoleChange(event.getUserId(), event.getChanges());
    }
}

@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['events', 'backend'],
	},
	{
		title: 'Distributed Lock with Redis',
		description:
			'Redis-based distributed lock with Lua release. Usage: lock.executeWithLock("resource", supplier, 5, TimeUnit.SECONDS)',
		code: `import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
public class DistributedLock {
    private final RedisTemplate<String, String> redisTemplate;
    private final String lockKeyPrefix = "lock:";

    @Autowired
    public DistributedLock(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Lock acquireLock(String lockName, long timeout, TimeUnit unit) {
        String lockKey = lockKeyPrefix + lockName;
        String lockValue = UUID.randomUUID().toString();
        long timeoutMillis = unit.toMillis(timeout);

        Boolean acquired = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, lockValue, timeoutMillis, TimeUnit.MILLISECONDS);

        if (Boolean.TRUE.equals(acquired)) {
            return new Lock(lockKey, lockValue, timeoutMillis);
        }
        return null;
    }

    public boolean releaseLock(Lock lock) {
        String luaScript =
            "if redis.call('get', KEYS[1]) == ARGV[1] then " +
            "    return redis.call('del', KEYS[1]) " +
            "else " +
            "    return 0 " +
            "end";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>(luaScript, Long.class);

        Long result = redisTemplate.execute(
            redisScript,
            Collections.singletonList(lock.getKey()),
            lock.getValue()
        );

        return Long.valueOf(1).equals(result);
    }

    public <T> T executeWithLock(String lockName, Supplier<T> supplier,
                                 long timeout, TimeUnit unit) {
        Lock lock = acquireLock(lockName, timeout, unit);
        if (lock == null) {
            throw new LockAcquisitionException("Failed to acquire lock: " + lockName);
        }

        try {
            return supplier.get();
        } finally {
            releaseLock(lock);
        }
    }

    public static class Lock {
        private final String key;
        private final String value;
        private final long expiry;

        // Constructor, getters
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['infrastructure', 'backend'],
	},
	{
		title: 'Reactive Streams with Project Reactor',
		description:
			'Reactive service with Mono/Flux and retries. Usage: service.enrichUserWithExternalData(id)',
		code: `import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.retry.Retry;
import java.time.Duration;
import java.util.function.Function;

@Service
public class ReactiveUserService {
    private final UserRepository userRepository;
    private final ExternalApiClient apiClient;

    @Autowired
    public ReactiveUserService(UserRepository userRepository,
                              ExternalApiClient apiClient) {
        this.userRepository = userRepository;
        this.apiClient = apiClient;
    }

    public Mono<User> getUserById(Long id) {
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new UserNotFoundException(id)))
            .subscribeOn(Schedulers.boundedElastic());
    }

    public Flux<User> getActiveUsers() {
        return userRepository.findByActiveTrue()
            .delayElements(Duration.ofMillis(100))
            .parallel()
            .runOn(Schedulers.parallel())
            .sequential();
    }

    public Mono<User> enrichUserWithExternalData(Long userId) {
        return getUserById(userId)
            .flatMap(user ->
                Mono.zip(
                    apiClient.getUserProfile(user.getEmail()),
                    apiClient.getUserPermissions(userId)
                )
                .map(tuple -> {
                    user.setProfile(tuple.getT1());
                    user.setPermissions(tuple.getT2());
                    return user;
                })
            )
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(throwable -> throwable instanceof TimeoutException))
            .timeout(Duration.ofSeconds(5))
            .onErrorResume(throwable -> {
                log.error("Failed to enrich user: " + userId, throwable);
                return getUserById(userId);
            });
    }

    public Flux<User> processUserBatch(List<Long> userIds,
                                       Function<User, Mono<Void>> processor) {
        return Flux.fromIterable(userIds)
            .flatMap(this::getUserById)
            .flatMap(processor)
            .thenMany(Flux.empty());
    }

    @Bean
    public Flux<User> realtimeUserUpdates() {
        return Flux.interval(Duration.ofSeconds(1))
            .flatMap(tick -> userRepository.findRecentlyUpdatedUsers())
            .distinct(User::getId)
            .share();
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['performance', 'backend'],
	},
	{
		title: 'CQRS Pattern with Event Sourcing',
		description:
			'CQRS with commands, events, aggregate, and projector. Usage: apply(new UserCreatedEvent(...))',
		code: `public class CreateUserCommand {
    private final String email;
    private final String name;
    // Constructor, getters
}

@Value
public class UserCreatedEvent {
    String userId;
    String email;
    String name;
    Instant occurredAt;
}

@Aggregate
public class UserAggregate {
    @AggregateIdentifier
    private String userId;
    private String email;
    private String name;
    private boolean active;

    @CommandHandler
    public UserAggregate(CreateUserCommand command) {
        apply(new UserCreatedEvent(
            UUID.randomUUID().toString(),
            command.getEmail(),
            command.getName(),
            Instant.now()
        ));
    }

    @EventSourcingHandler
    public void on(UserCreatedEvent event) {
        this.userId = event.getUserId();
        this.email = event.getEmail();
        this.name = event.getName();
        this.active = true;
    }
}

@Repository
public class UserQueryRepository {
    private final JdbcTemplate jdbcTemplate;

    public UserView findById(String userId) {
        String sql = "SELECT * FROM user_views WHERE user_id = ?";
        return jdbcTemplate.queryForObject(sql,
            new BeanPropertyRowMapper<>(UserView.class), userId);
    }

    public List<UserView> findActiveUsers() {
        String sql = "SELECT * FROM user_views WHERE active = true";
        return jdbcTemplate.query(sql,
            new BeanPropertyRowMapper<>(UserView.class));
    }
}

@Component
public class UserProjector {

    @EventHandler
    public void on(UserCreatedEvent event,
                   @SequenceNumber long version) {
        UserView view = new UserView();
        view.setUserId(event.getUserId());
        view.setEmail(event.getEmail());
        view.setName(event.getName());
        view.setActive(true);
        view.setVersion(version);

        userViewRepository.save(view);
    }

    @EventHandler
    public void on(UserUpdatedEvent event) {
        userViewRepository.findById(event.getUserId())
            .ifPresent(view -> {
                view.setName(event.getName());
                view.setVersion(event.getVersion());
                userViewRepository.save(view);
            });
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['architecture', 'backend'],
	},
	{
		title: 'GraphQL Resolver with DataLoader',
		description:
			'GraphQL resolver and DataLoader batching. Usage: userDataLoader.loadUser(id)',
		code: `import com.graphqljava.tutorial.bookdetails.*;
import org.dataloader.BatchLoader;
import org.dataloader.DataLoader;
import org.springframework.stereotype.Component;
import java.util.concurrent.CompletableFuture;

@Component
public class UserDataLoader {
    private final UserService userService;
    private final DataLoader<Long, User> userLoader;

    public UserDataLoader(UserService userService) {
        this.userService = userService;

        BatchLoader<Long, User> batchLoader = (userIds) ->
            CompletableFuture.supplyAsync(() ->
                userService.findByIds(userIds)
            );

        this.userLoader = DataLoader.newDataLoader(batchLoader);
    }

    public CompletableFuture<User> loadUser(Long userId) {
        return userLoader.load(userId);
    }

    public void prime(User user) {
        userLoader.prime(user.getId(), user);
    }
}

@Controller
public class UserGraphQLResolver {
    private final UserDataLoader userDataLoader;
    private final PostService postService;

    @Autowired
    public UserGraphQLResolver(UserDataLoader userDataLoader,
                              PostService postService) {
        this.userDataLoader = userDataLoader;
        this.postService = postService;
    }

    @QueryMapping
    public CompletableFuture<User> user(@Argument Long id) {
        return userDataLoader.loadUser(id);
    }

    @SchemaMapping
    public CompletableFuture<List<Post>> posts(User user) {
        return postService.findByAuthorId(user.getId())
            .collectList()
            .toFuture();
    }

    @BatchMapping
    public CompletableFuture<List<Comment>> comments(List<User> users) {
        return commentService.findByUserIds(
            users.stream().map(User::getId).collect(Collectors.toList())
        ).collectList().toFuture();
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['api', 'backend'],
	},
	{
		title: 'Retry Mechanism with Exponential Backoff',
		description:
			'Configurable retry template with exponential backoff. Usage: retryTemplate.execute(() -> restTemplate.getForObject(...))',
		code: `@Component
public class RetryTemplate {
    private final int maxAttempts;
    private final long initialDelay;
    private final double multiplier;
    private final Set<Class<? extends Throwable>> retryableExceptions;

    private RetryTemplate(Builder builder) {
        this.maxAttempts = builder.maxAttempts;
        this.initialDelay = builder.initialDelay;
        this.multiplier = builder.multiplier;
        this.retryableExceptions = builder.retryableExceptions;
    }

    public <T> T execute(Supplier<T> supplier) throws Exception {
        Exception lastException = null;
        long delay = initialDelay;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return supplier.get();
            } catch (Exception e) {
                lastException = e;

                if (!shouldRetry(e) || attempt == maxAttempts) {
                    throw e;
                }

                log.warn("Attempt {} failed, retrying in {} ms", attempt, delay);
                Thread.sleep(delay);
                delay = (long) (delay * multiplier);
            }
        }

        throw new RuntimeException("Unexpected error in retry loop", lastException);
    }

    private boolean shouldRetry(Exception e) {
        return retryableExceptions.stream()
            .anyMatch(ex -> ex.isAssignableFrom(e.getClass()));
    }

    public static class Builder {
        private int maxAttempts = 3;
        private long initialDelay = 1000;
        private double multiplier = 2.0;
        private Set<Class<? extends Throwable>> retryableExceptions = new HashSet<>();

        public Builder maxAttempts(int maxAttempts) {
            this.maxAttempts = maxAttempts;
            return this;
        }

        public Builder initialDelay(long delay, TimeUnit unit) {
            this.initialDelay = unit.toMillis(delay);
            return this;
        }

        public Builder multiplier(double multiplier) {
            this.multiplier = multiplier;
            return this;
        }

        @SafeVarargs
        public final Builder retryOn(Class<? extends Throwable>... exceptions) {
            this.retryableExceptions.addAll(Arrays.asList(exceptions));
            return this;
        }

        public RetryTemplate build() {
            return new RetryTemplate(this);
        }
    }
}

@Service
public class ExternalApiService {
    private final RetryTemplate retryTemplate;
    private final RestTemplate restTemplate;

    public ExternalApiService() {
        this.retryTemplate = new RetryTemplate.Builder()
            .maxAttempts(5)
            .initialDelay(1, TimeUnit.SECONDS)
            .multiplier(2.0)
            .retryOn(TimeoutException.class, IOException.class)
            .build();
    }

    public ApiResponse callExternalApi(String endpoint) throws Exception {
        return retryTemplate.execute(() ->
            restTemplate.getForObject(endpoint, ApiResponse.class)
        );
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['utilities', 'backend'],
	},
	{
		title: 'Generic Cache with Multiple Eviction Policies',
		description:
			'Cache with LRU/LFU/FIFO/TTL eviction and stats. Usage: cache.getStats()',
		code: `public class AdvancedCache<K, V> {
    private final Map<K, CacheEntry<V>> cache;
    private final int maxSize;
    private final EvictionPolicy policy;
    private final long ttl;

    public enum EvictionPolicy {
        LRU, LFU, FIFO, TTL
    }

    private static class CacheEntry<V> {
        final V value;
        final long creationTime;
        long lastAccessTime;
        long accessCount;

        CacheEntry(V value) {
            this.value = value;
            this.creationTime = System.currentTimeMillis();
            this.lastAccessTime = creationTime;
            this.accessCount = 1;
        }

        void accessed() {
            lastAccessTime = System.currentTimeMillis();
            accessCount++;
        }
    }

    public AdvancedCache(int maxSize, EvictionPolicy policy, long ttl, TimeUnit unit) {
        this.cache = policy == EvictionPolicy.LRU ?
            new LinkedHashMap<>(maxSize, 0.75f, true) :
            new ConcurrentHashMap<>();
        this.maxSize = maxSize;
        this.policy = policy;
        this.ttl = unit.toMillis(ttl);
    }

    public synchronized void put(K key, V value) {
        if (cache.size() >= maxSize) {
            evict();
        }
        cache.put(key, new CacheEntry<>(value));
    }

    public V get(K key) {
        CacheEntry<V> entry = cache.get(key);
        if (entry == null) return null;

        if (policy == EvictionPolicy.TTL &&
            System.currentTimeMillis() - entry.creationTime > ttl) {
            cache.remove(key);
            return null;
        }

        entry.accessed();
        return entry.value;
    }

    private void evict() {
        if (cache.isEmpty()) return;

        switch (policy) {
            case LRU:
                evictLRU();
                break;
            case LFU:
                evictLFU();
                break;
            case FIFO:
                evictFIFO();
                break;
            case TTL:
                evictTTL();
                break;
        }
    }

    private void evictLRU() {
        K lruKey = cache.entrySet().stream()
            .min(Comparator.comparing(e -> e.getValue().lastAccessTime))
            .map(Map.Entry::getKey)
            .orElse(null);

        if (lruKey != null) {
            cache.remove(lruKey);
        }
    }

    private void evictLFU() {
        K lfuKey = cache.entrySet().stream()
            .min(Comparator.comparing(e -> e.getValue().accessCount))
            .map(Map.Entry::getKey)
            .orElse(null);

        if (lfuKey != null) {
            cache.remove(lfuKey);
        }
    }

    private void evictFIFO() {
        K oldestKey = cache.entrySet().stream()
            .min(Comparator.comparing(e -> e.getValue().creationTime))
            .map(Map.Entry::getKey)
            .orElse(null);

        if (oldestKey != null) {
            cache.remove(oldestKey);
        }
    }

    private void evictTTL() {
        cache.entrySet().removeIf(entry ->
            System.currentTimeMillis() - entry.getValue().creationTime > ttl
        );
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("size", cache.size());
        stats.put("maxSize", maxSize);
        stats.put("policy", policy);

        if (!cache.isEmpty()) {
            double avgHits = cache.values().stream()
                .mapToLong(e -> e.accessCount)
                .average()
                .orElse(0);
            stats.put("averageHits", avgHits);
        }

        return stats;
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['data', 'performance'],
	},
	{
		title: 'WebSocket Chat Application with STOMP',
		description:
			'Spring WebSocket chat with STOMP endpoints. Usage: /ws-chat endpoint with /topic and /queue destinations.',
		code: `@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
            .setAllowedOrigins("*")
            .withSockJS();
    }
}

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatRoomService chatRoomService;

    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendPublicMessage(@Payload ChatMessage message) {
        message.setTimestamp(Instant.now());
        return message;
    }

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload PrivateMessage message) {
        message.setTimestamp(Instant.now());

        messagingTemplate.convertAndSendToUser(
            message.getRecipient(),
            "/queue/private",
            message
        );

        chatRoomService.saveMessage(message);
    }

    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload TypingIndicator indicator) {
        messagingTemplate.convertAndSend(
            "/topic/typing." + indicator.getRoomId(),
            indicator
        );
    }

    @MessageMapping("/chat.join")
    @SendTo("/topic/public")
    public UserJoinedMessage userJoined(@Payload UserJoinedMessage message) {
        return message;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String username = headers.getFirstNativeHeader("username");

        if (username != null) {
            chatRoomService.userConnected(username);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String username = headers.getFirstNativeHeader("username");

        if (username != null) {
            chatRoomService.userDisconnected(username);

            UserDisconnectedMessage message = new UserDisconnectedMessage(username);
            messagingTemplate.convertAndSend("/topic/public", message);
        }
    }
}

@Component
public class ChatRoomService {
    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();
    private final Map<String, List<ChatMessage>> messageHistory = new ConcurrentHashMap<>();

    public void userConnected(String username) {
        activeUsers.add(username);
    }

    public void userDisconnected(String username) {
        activeUsers.remove(username);
    }

    public Set<String> getActiveUsers() {
        return Set.copyOf(activeUsers);
    }

    public void saveMessage(PrivateMessage message) {
        messageHistory.computeIfAbsent(
            message.getRoomId(),
            k -> new ArrayList<>()
        ).add(message);

        List<ChatMessage> messages = messageHistory.get(message.getRoomId());
        if (messages.size() > 100) {
            messages.remove(0);
        }
    }

    public List<ChatMessage> getMessageHistory(String roomId, int limit) {
        return messageHistory.getOrDefault(roomId, new ArrayList<>())
            .stream()
            .skip(Math.max(0, messageHistory.getOrDefault(roomId, new ArrayList<>()).size() - limit))
            .collect(Collectors.toList());
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['network', 'backend'],
	},
	{
		title: 'Batch Processing with Spring Batch',
		description:
			'Spring Batch job with reader, processor, writer, and REST controller. Usage: POST /api/batch/start',
		code: `@Configuration
@EnableBatchProcessing
public class BatchConfiguration {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public FlatFileItemReader<User> reader() {
        return new FlatFileItemReaderBuilder<User>()
            .name("userItemReader")
            .resource(new FileSystemResource("input/users.csv"))
            .delimited()
            .names(new String[]{"id", "name", "email", "age"})
            .fieldSetMapper(new BeanWrapperFieldSetMapper<>() {{
                setTargetType(User.class);
            }})
            .build();
    }

    @Bean
    public ItemProcessor<User, ProcessedUser> processor() {
        return user -> {
            if (user.getAge() < 18) {
                return null;
            }

            ProcessedUser processed = new ProcessedUser();
            processed.setUserId(user.getId());
            processed.setFullName(user.getName().toUpperCase());
            processed.setEmailDomain(extractDomain(user.getEmail()));
            processed.setProcessedAt(LocalDateTime.now());

            return processed;
        };
    }

    @Bean
    public JdbcBatchItemWriter<ProcessedUser> writer(DataSource dataSource) {
        return new JdbcBatchItemWriterBuilder<ProcessedUser>()
            .itemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>())
            .sql("INSERT INTO processed_users (user_id, full_name, email_domain, processed_at) " +
                 "VALUES (:userId, :fullName, :emailDomain, :processedAt)")
            .dataSource(dataSource)
            .build();
    }

    @Bean
    public Step step1(JdbcBatchItemWriter<ProcessedUser> writer) {
        return stepBuilderFactory.get("step1")
            .<User, ProcessedUser>chunk(10)
            .reader(reader())
            .processor(processor())
            .writer(writer)
            .faultTolerant()
            .skipLimit(5)
            .skip(ValidationException.class)
            .retryLimit(3)
            .retry(DeadlockLoserDataAccessException.class)
            .listener(new ChunkListener() {
                @Override
                public void beforeChunk(ChunkContext context) {
                    log.info("Starting chunk");
                }

                @Override
                public void afterChunk(ChunkContext context) {
                    log.info("Completed chunk: {}",
                        context.getStepContext().getStepExecution().getWriteCount());
                }
            })
            .build();
    }

    @Bean
    public Job importUserJob(JobCompletionNotificationListener listener, Step step1) {
        return jobBuilderFactory.get("importUserJob")
            .incrementer(new RunIdIncrementer())
            .listener(listener)
            .flow(step1)
            .next(validateStep())
            .next(notificationStep())
            .end()
            .build();
    }

    @Bean
    public Step validateStep() {
        return stepBuilderFactory.get("validateStep")
            .tasklet((contribution, chunkContext) -> {
                return RepeatStatus.FINISHED;
            })
            .build();
    }

    @Bean
    public Step notificationStep() {
        return stepBuilderFactory.get("notificationStep")
            .tasklet(new NotificationTasklet())
            .build();
    }
}

@Component
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("!!! JOB FINISHED! Time to verify the results");

            notificationService.sendJobCompletionEmail(jobExecution);
            archiveService.archiveResults(jobExecution.getJobId());
        }
    }

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("Starting job: {}", jobExecution.getJobInstance().getJobName());
        metricsService.startJobMetrics(jobExecution);
    }
}

@RestController
@RequestMapping("/api/batch")
public class BatchController {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job importUserJob;

    @PostMapping("/start")
    public ResponseEntity<JobExecution> startBatch(
            @RequestParam Optional<String> filePath) throws Exception {

        JobParameters parameters = new JobParametersBuilder()
            .addString("filePath", filePath.orElse("default.csv"))
            .addDate("timestamp", new Date())
            .addString("correlationId", UUID.randomUUID().toString())
            .toJobParameters();

        JobExecution execution = jobLauncher.run(importUserJob, parameters);

        return ResponseEntity.ok(execution);
    }

    @GetMapping("/status/{executionId}")
    public ResponseEntity<JobExecution> getStatus(@PathVariable Long executionId) {
        return ResponseEntity.ok(jobExplorer.getJobExecution(executionId));
    }

    @PostMapping("/stop/{executionId}")
    public ResponseEntity<String> stopJob(@PathVariable Long executionId) {
        try {
            jobOperator.stop(executionId);
            return ResponseEntity.ok("Job stopping initiated");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
`,
		language: 'java',
		technologies: ['java'],
		categories: ['data', 'infrastructure'],
	},
]
