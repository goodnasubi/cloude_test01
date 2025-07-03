import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AddressUtilTest {
    
    @Test
    void testRemovePortFromIPv4() {
        assertEquals("192.168.1.1", AddressUtil.removePort("192.168.1.1:8080"));
        assertEquals("10.0.0.1", AddressUtil.removePort("10.0.0.1:3000"));
        assertEquals("127.0.0.1", AddressUtil.removePort("127.0.0.1:80"));
        assertEquals("255.255.255.255", AddressUtil.removePort("255.255.255.255:65535"));
    }
    
    @Test
    void testRemovePortFromIPv4WithoutPort() {
        assertEquals("192.168.1.1", AddressUtil.removePort("192.168.1.1"));
        assertEquals("10.0.0.1", AddressUtil.removePort("10.0.0.1"));
        assertEquals("127.0.0.1", AddressUtil.removePort("127.0.0.1"));
    }
    
    @Test
    void testRemovePortFromIPv6WithBrackets() {
        assertEquals("::1", AddressUtil.removePort("[::1]:8080"));
        assertEquals("2001:db8::1", AddressUtil.removePort("[2001:db8::1]:3000"));
        assertEquals("fe80::1%lo0", AddressUtil.removePort("[fe80::1%lo0]:80"));
        assertEquals("2001:0db8:85a3:0000:0000:8a2e:0370:7334", 
                    AddressUtil.removePort("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:9000"));
    }
    
    @Test
    void testRemovePortFromIPv6WithoutBrackets() {
        assertEquals("::1", AddressUtil.removePort("::1"));
        assertEquals("2001:db8::1", AddressUtil.removePort("2001:db8::1"));
        assertEquals("fe80::1%lo0", AddressUtil.removePort("fe80::1%lo0"));
        assertEquals("2001:0db8:85a3:0000:0000:8a2e:0370:7334", 
                    AddressUtil.removePort("2001:0db8:85a3:0000:0000:8a2e:0370:7334"));
    }
    
    @Test
    void testRemovePortFromDomain() {
        assertEquals("example.com", AddressUtil.removePort("example.com:8080"));
        assertEquals("www.google.com", AddressUtil.removePort("www.google.com:443"));
        assertEquals("localhost", AddressUtil.removePort("localhost:3000"));
        assertEquals("api.example.org", AddressUtil.removePort("api.example.org:8000"));
    }
    
    @Test
    void testRemovePortFromDomainWithoutPort() {
        assertEquals("example.com", AddressUtil.removePort("example.com"));
        assertEquals("www.google.com", AddressUtil.removePort("www.google.com"));
        assertEquals("localhost", AddressUtil.removePort("localhost"));
        assertEquals("api.example.org", AddressUtil.removePort("api.example.org"));
    }
    
    @Test
    void testEdgeCases() {
        assertNull(AddressUtil.removePort(null));
        assertEquals("", AddressUtil.removePort(""));
        assertEquals("invalid:address:format", AddressUtil.removePort("invalid:address:format"));
        assertEquals("[]", AddressUtil.removePort("[]"));
        assertEquals("[", AddressUtil.removePort("["));
        assertEquals("]", AddressUtil.removePort("]"));
    }
    
    @Test
    void testIPv6WithMultipleColons() {
        assertEquals("2001:db8:85a3::8a2e:370:7334", 
                    AddressUtil.removePort("2001:db8:85a3::8a2e:370:7334"));
        assertEquals("::ffff:192.0.2.1", AddressUtil.removePort("::ffff:192.0.2.1"));
    }
    
    @Test
    void testPortNumbers() {
        assertEquals("example.com", AddressUtil.removePort("example.com:1"));
        assertEquals("example.com", AddressUtil.removePort("example.com:65535"));
        assertEquals("192.168.1.1", AddressUtil.removePort("192.168.1.1:0"));
        assertEquals("::1", AddressUtil.removePort("[::1]:12345"));
    }
    
    @Test
    void testInvalidPorts() {
        assertEquals("example.com:abc", AddressUtil.removePort("example.com:abc"));
        assertEquals("example.com:-1", AddressUtil.removePort("example.com:-1"));
        assertEquals("example.com:99999", AddressUtil.removePort("example.com:99999"));
    }
}