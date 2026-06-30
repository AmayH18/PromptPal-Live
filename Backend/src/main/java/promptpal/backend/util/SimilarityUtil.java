package promptpal.backend.util;

import java.util.List;

public class SimilarityUtil {

    public static double cosine(List<Double> a, List<Double> b) {

        double dot = 0, normA = 0, normB = 0;

        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
