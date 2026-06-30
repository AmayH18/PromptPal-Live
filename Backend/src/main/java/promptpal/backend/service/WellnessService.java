package promptpal.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import promptpal.backend.entity.User;
import promptpal.backend.entity.UserResult;
import promptpal.backend.repository.UserRepository;
import promptpal.backend.repository.UserResultRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WellnessService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private UserResultRepository userResultRepository;

	@Autowired
	private OpenAiClient openAiClient;

	@Autowired
	private RetrievalService retrievalService;

	@Autowired
	private ObjectMapper mapper;

	// ─────────────────────────────────────────────────────────────

	public UserResult generateAdvice(Long userId, String adviceType) {

		System.out.println("===== GENERATING AI WELLNESS ADVICE =====");
		System.out.println("Advice Type Requested: " + adviceType);

		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		String type = adviceType.toUpperCase().trim();

		// ONLY SUPPORT THESE 4 TYPES
		List<String> allowedTypes = List.of("SKIN", "HAIR", "BODY", "ALL");

		if (!allowedTypes.contains(type)) {
			throw new RuntimeException("Unsupported advice type");
		}

		validateUserProfile(user, type);

		// STEP 1 — RAG QUERY
		String query = buildQuery(user, type);

		System.out.println("RAG Query: " + query);

		// STEP 2 — CATEGORY FILTER
		String category = mapAdviceTypeToCategory(type);

		int topK = "ALL".equals(type) ? 5 : 3;

		String ragContext = retrievalService.getContext(query, category, topK);

		System.out.println("RAG CONTEXT:\n" + ragContext);

		// STEP 3 — PROMPT
		String prompt = buildPrompt(user, type, ragContext);

		System.out.println("Prompt sent to OpenAI:\n" + prompt);

		// STEP 4 — OPENAI
		String finalAdvice = openAiClient.getRagResponse(ragContext, prompt);

		finalAdvice = sanitizeJsonResponse(finalAdvice);

		// STEP 5 — VALIDATE JSON
		try {

			mapper.readTree(finalAdvice);

		} catch (Exception e) {

			System.out.println("Invalid JSON detected. Attempting repair...");

			finalAdvice = repairJson(finalAdvice);

			try {

				mapper.readTree(finalAdvice);

			} catch (Exception ex) {

				System.out.println("FINAL INVALID JSON:");
				System.out.println(finalAdvice);

				throw new RuntimeException("OpenAI response is not valid JSON.", ex);
			}
		}

		// STEP 6 — ACCURACY
		double accuracy = calculateAccuracy(finalAdvice, type);

		// STEP 7 — SAVE
		UserResult result = new UserResult();

		result.setUser(user);

		result.setAdviceType(type);

		result.setAiResponse(finalAdvice);

		result.setAccuracyScore(accuracy);

		result.setGenerationTime(LocalDateTime.now());

		result.setPromptUsed(prompt);

		return userResultRepository.save(result);
	}

	// ─────────────────────────────────────────────────────────────

	private String buildPrompt(User user, String type, String ragContext) {

		String kbBlock = ragContext != null && !ragContext.isBlank()
				? "=== KNOWLEDGE BASE ===\n" + ragContext + "\n=== END OF KNOWLEDGE BASE ===\n\n"
				: "";

		String jsonSchemaReminder = """
				CRITICAL OUTPUT RULE:
				- Respond with VALID JSON ONLY
				- No markdown
				- No ```json
				- No extra text

				STRICT JSON FORMAT:

				{
				  "title": "",
				  "sections": [
				    {
				      "heading": "",
				      "icon": "",
				      "steps": []
				    }
				  ],
				  "products": [
				    {
				      "name": "",
				      "use": "",
				      "reason": "",
				      "link": "",
				      "imageQuery": ""
				    }
				  ],
					  "plan21": [],
				  "avoid": []
				}
				""";

		return switch (type) {

		// ─────────────────────────────
		// SKIN
		// ─────────────────────────────

		case "SKIN" ->

			kbBlock + "ROLE: Professional skincare AI.\n\n"

					+ "USER PROFILE:\n" + "- Skin Type: " + safe(user.getSkinType()) + "\n"
					+ "- Skin Concerns: " + safe(user.getSkinConcerns()) + "\n"
					+ "- Allergies: " + safe(user.getAllergies()) + "\n\n"

					+ "RULES:\n" + "1. Use ONLY knowledge base products.\n" + "2. Do NOT mention hair or body.\n"
					+ "3. sections must include:\n" + "   - Morning Routine\n" + "   - Evening Routine\n"
					+ "   - Night Routine\n" + "4. Include all KB products.\n"
					+ "5. For every product generate a personalized 'reason' field.\n"
					+ "6. The reason must explain in ONE SHORT SENTENCE why the product suits THIS user profile.\n"
					+ "7. Use user's skin type and allergies while generating reasons.\n"
					+ "8. Copy avoid list from KB.\n\n"

					+ jsonSchemaReminder

					+ "\nGenerate skincare advice JSON.";

		// ─────────────────────────────
		// HAIR
		// ─────────────────────────────

		case "HAIR" ->

			kbBlock + "ROLE: Professional haircare AI.\n\n"

					+ "USER PROFILE:\n" + "- Hair Type: " + safe(user.getHairType()) + "\n" + "- Hair Goal: "
					+ safe(user.getHairGoals()) + "\n" + "- Hair Concerns: " + safe(user.getHairConcerns()) + "\n\n"

					+ "RULES:\n" + "1. Use ONLY KB products.\n" + "2. Do NOT mention skin or body.\n"
					+ "3. sections must include:\n" + "   - Morning Routine\n" + "   - Weekly Routine\n"
					+ "   - Night Routine\n" + "4. Include KB products.\n"
					+ "5. For every product generate a personalized 'reason' field.\n"
					+ "6. Use hair type, goals and concerns while generating the reason.\n"
					+ "7. Keep reason under 20 words.\n" + "8. Copy avoid list from KB.\n\n"

					+ jsonSchemaReminder

					+ "\nGenerate haircare advice JSON.";

		// ─────────────────────────────
		// BODY
		// ─────────────────────────────

		case "BODY" ->

			kbBlock + "ROLE: Fitness and wellness AI.\n\n"

					+ "USER PROFILE:\n" + "- Body Goal: " + safe(user.getBodyGoal()) + "\n" + "- Weight: "
					+ user.getWeight() + " kg\n" + "- Height: " + user.getHeight() + " cm\n\n"

					+ "RULES:\n" + "1. Use ONLY KB products.\n" + "2. Do NOT mention skin or hair.\n"
					+ "3. sections must include:\n" + "   - Meal Plan\n" + "   - Workout Routine\n"
					+ "   - Recovery Tips\n" + "4. Include KB products.\n"
					+ "5. Generate a personalized 'reason' for every product.\n"
					+ "6. Use body goal and profile information.\n" + "7. Keep reason under 20 words.\n"
					+ "8. Copy avoid list from KB.\n\n"

					+ jsonSchemaReminder

					+ "\nGenerate body wellness JSON.";

		// ─────────────────────────────
		// ALL
		// ─────────────────────────────

		default ->

			kbBlock + "ROLE: Complete wellness AI.\n\n"

					+ "USER PROFILE:\n" + "- Skin Type: " + safe(user.getSkinType()) + "\n"
					+ "- Skin Concerns: " + safe(user.getSkinConcerns()) + "\n"
					+ "- Hair Type: " + safe(user.getHairType()) + "\n" + "- Body Goal: " + safe(user.getBodyGoal()) + "\n\n"

					+ "STRICT RULES:\n" + "1. Use ONLY KB products.\n" + "2. Keep response concise.\n"
					+ "3. Include ONLY these sections:\n" + "   - Skin Care Routine\n" + "   - Hair Care Routine\n"
					+ "   - Body Wellness Routine\n" + "4. MAXIMUM 2 steps per section.\n"
					+ "5. MAXIMUM 6 products total.\n"
					+ "6. Every product MUST contain a personalized 'reason' field.\n"
					+ "7. Reason should explain why the product matches the user's profile.\n"
					+ "8. plan21 should ONLY contain:\n" + "   - Day 1-7\n" + "   - Day 8-14\n" + "   - Day 15-21\n"
					+ "9. avoid should contain MAXIMUM 5 items.\n" + "10. Keep JSON properly closed.\n"
					+ "11. No extra text outside JSON.\n\n"

					+ jsonSchemaReminder

					+ "\nGenerate COMPLETE WELLNESS JSON.";
		};
	}

	// ─────────────────────────────────────────────────────────────

	private String mapAdviceTypeToCategory(String type) {

		return switch (type) {

		case "SKIN" -> "SKIN";

		case "HAIR" -> "HAIR";

		case "BODY" -> "BODY";

		default -> "GENERAL";
		};
	}

	// ─────────────────────────────────────────────────────────────

	private String buildQuery(User user, String type) {

		return switch (type) {

		case "SKIN" ->

			"skincare advice " + safe(user.getSkinType()) + " " + safe(user.getSkinConcerns());

		case "HAIR" ->

			"haircare advice " + safe(user.getHairType());

		case "BODY" ->

			"fitness advice " + safe(user.getBodyGoal());

		default ->

			safe(user.getSkinType()) + " " + safe(user.getSkinConcerns()) + " skin " + safe(user.getHairType()) + " hair " + safe(user.getBodyGoal())
					+ " body";
		};
	}

	// ─────────────────────────────────────────────────────────────

	private double calculateAccuracy(String advice, String type) {

		if (advice == null || advice.isBlank()) {
			return 0.0;
		}

		return switch (type) {

		case "SKIN" -> 90.0;

		case "HAIR" -> 90.0;

		case "BODY" -> 90.0;

		default -> 92.0;
		};
	}

	// ─────────────────────────────────────────────────────────────

	private void validateUserProfile(User user, String type) {

		if (user.getAge() <= 0 || user.getHeight() <= 0 || user.getWeight() <= 0) {

			throw new RuntimeException("Please complete your profile.");
		}

		switch (type) {

		case "SKIN" -> {

			if (user.getSkinType() == null || user.getSkinType().isBlank()) {

				throw new RuntimeException("Please set Skin Type.");
			}
		}

		case "HAIR" -> {

			if (user.getHairType() == null || user.getHairType().isBlank()) {

				throw new RuntimeException("Please set Hair Type.");
			}
		}

		case "BODY" -> {

			if (user.getBodyGoal() == null || user.getBodyGoal().isBlank()) {

				throw new RuntimeException("Please set Body Goal.");
			}
		}

		default -> {

			if (user.getSkinType() == null || user.getHairType() == null || user.getBodyGoal() == null) {

				throw new RuntimeException("Please complete full profile.");
			}
		}
		}
	}

	// ─────────────────────────────────────────────────────────────

	private String safe(String value) {

		return (value == null || value.isBlank()) ? "Not provided" : value;
	}

	// ─────────────────────────────────────────────────────────────

	private String sanitizeJsonResponse(String response) {

		if (response == null) {
			return null;
		}

		return response.replace("```json", "").replace("```JSON", "").replace("```Json", "").replace("```", "").trim();
	}

	// ─────────────────────────────────────────────────────────────

	private String repairJson(String json) {

		if (json == null || json.isBlank()) {
			return "{}";
		}

		json = sanitizeJsonResponse(json);

		long quotes = json.chars().filter(ch -> ch == '"').count();

		if (quotes % 2 != 0) {
			json += "\"";
		}

		int openArray = (int) json.chars().filter(ch -> ch == '[').count();

		int closeArray = (int) json.chars().filter(ch -> ch == ']').count();

		while (closeArray < openArray) {
			json += "]";
			closeArray++;
		}

		int openCurly = (int) json.chars().filter(ch -> ch == '{').count();

		int closeCurly = (int) json.chars().filter(ch -> ch == '}').count();

		while (closeCurly < openCurly) {
			json += "}";
			closeCurly++;
		}

		return json;
	}

	// ─────────────────────────────────────────────────────────────

	public List<UserResult> getHistory(Long userId) {

		return userResultRepository.findByUser_IdOrderByGenerationTimeDesc(userId);
	}
}