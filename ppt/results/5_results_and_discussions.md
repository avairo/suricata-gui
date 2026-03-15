# 5. RESULTS AND DISCUSSIONS

## Results
The implementation of the SENTINEL SOC dashboard yielded a fully functional, integrated system capable of real-time threat monitoring and analysis. Key outcomes include:
1. **Successful Data Ingestion:** The Python backend reliably parses Suricata's `eve.json` logs from the Ubuntu VM, structuring the raw data into actionable JSON payloads without noticeable latency.
2. **Interactive Visualization:** The Next.js frontend successfully renders the parsed data. The interactive IP geolocation map provides immediate visual context for where threats are originating, significantly improving situational awareness compared to reading text logs.
3. **AI-Powered Threat Intelligence:** The integration of the Google Gemini API has proven highly effective. It successfully translates complex Suricata alert signatures (e.g., "ET MALWARE Suspicious User-Agent") into practical, easy-to-understand explanations for analysts.
4. **Conversational Assistance:** The implementation of the AI chatbot within the dashboard provides a continuous, context-aware assistant, allowing analysts to query specific IPs, understand vulnerabilities, and receive suggested mitigation strategies dynamically.
5. **Aesthetic Cohesion:** The application of custom typography ('Coluna', 'SuperMario') and a dark, modern theme created a cohesive "hacker/SOC" aesthetic, resulting in an engaging user experience.

## Challenges
During the development and integration phases, several challenges were encountered and addressed:
1. **Log Parsing Complexity:** Suricata's `eve.json` files can grow rapidly and contain deeply nested JSON structures varying by event type (alert, flow, dns, etc.). Developing a backend parser that efficiently handled this variability without crashing or dropping logs required extensive file I/O optimization in Python.
2. **Cross-Environment Networking (VM to Host):** Establishing reliable, continuous communication between the Suricata instance running on the isolated Ubuntu VM and the backend/frontend servers running on the host OS requires careful configuration of network adapters, firewalls, and port forwarding (managed via scripts like `run_ubuntu.sh`).
3. **AI API Rate Limiting and Latency:** Integrating the Gemini API introduced external dependencies. Managing API rate limits and handling the latency of AI response generation without freezing the frontend UI necessitated implementing asynchronous API calls and proper loading states in React.
4. **Font Integration in Next.js:** Ensuring custom fonts loaded securely and consistently across different browsers without layout shifts required specific configuration using Next.js's local font optimization features (`next/font/local`).
5. **Real-time State Management:** Synchronizing the live stream of alerts with the React frontend state (especially the interactive IP map) to ensure smooth rendering without performance degradation as the data volume scaled was a continuous optimization target.
