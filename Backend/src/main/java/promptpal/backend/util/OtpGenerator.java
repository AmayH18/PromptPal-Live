package promptpal.backend.util;
import java.security.SecureRandom;


public class OtpGenerator {
    private static final SecureRandom secureRandom = new SecureRandom();

    
    public static String generateOtp() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
}

