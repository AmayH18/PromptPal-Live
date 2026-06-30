package promptpal.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class HuggingFaceClient {

    private final WebClient webClient;

    public HuggingFaceClient(
            WebClient.Builder builder,
            @Value("${hf.api.key}") String apiKey) {

        this.webClient = builder
                .baseUrl("https://api-inference.huggingface.co/models/google/flan-t5-small")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public String getAdvice(String prompt) {

        Map<String, Object> request = Map.of(
                "inputs", prompt
        );

        Object response = webClient.post()
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Object.class)
                .block();

        if (response instanceof List<?> list && !list.isEmpty()) {
            Map<?, ?> first = (Map<?, ?>) list.get(0);
            return first.get("generated_text").toString();
        }

        return "HuggingFace returned no text";
    }
}


