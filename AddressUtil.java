import java.util.regex.Pattern;

public class AddressUtil {
    
    private static final Pattern IPV4_PATTERN = Pattern.compile(
        "^(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(?::(\\d+))?$"
    );
    
    private static final Pattern IPV6_PATTERN = Pattern.compile(
        "^\\[([0-9a-fA-F:]+)\\](?::(\\d+))?$|^([0-9a-fA-F:]+)$"
    );
    
    private static final Pattern DOMAIN_PATTERN = Pattern.compile(
        "^([a-zA-Z0-9.-]+)(?::(\\d+))?$"
    );
    
    public static String removePort(String address) {
        if (address == null || address.isEmpty()) {
            return address;
        }
        
        // IPv6 with brackets and port
        if (address.startsWith("[")) {
            int closeBracket = address.indexOf(']');
            if (closeBracket != -1) {
                return address.substring(1, closeBracket);
            }
        }
        
        // IPv4 check
        if (IPV4_PATTERN.matcher(address).matches()) {
            int colonIndex = address.lastIndexOf(':');
            if (colonIndex != -1) {
                return address.substring(0, colonIndex);
            }
            return address;
        }
        
        // IPv6 without brackets
        if (address.contains(":") && !address.contains(".")) {
            // Simple IPv6 without port
            return address;
        }
        
        // Domain name with port
        int colonIndex = address.lastIndexOf(':');
        if (colonIndex != -1) {
            String portPart = address.substring(colonIndex + 1);
            if (portPart.matches("\\d+")) {
                return address.substring(0, colonIndex);
            }
        }
        
        return address;
    }
    
    public static void main(String[] args) {
        // Test cases
        System.out.println(removePort("192.168.1.1:8080"));        // 192.168.1.1
        System.out.println(removePort("192.168.1.1"));             // 192.168.1.1
        System.out.println(removePort("[::1]:8080"));              // ::1
        System.out.println(removePort("::1"));                     // ::1
        System.out.println(removePort("example.com:8080"));        // example.com
        System.out.println(removePort("example.com"));             // example.com
        System.out.println(removePort("[2001:db8::1]:3000"));      // 2001:db8::1
        System.out.println(removePort("2001:db8::1"));             // 2001:db8::1
    }
}