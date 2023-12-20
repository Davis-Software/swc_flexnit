interface UserMetrics {
    id: number;
    username: string;
    delivered_media: number;
    delivered_bytes: number;
    delivered_requests_2xx: number;
    delivered_requests_3xx: number;
    delivered_requests_4xx: number;
    delivered_requests_5xx: number;
    last_ip: string;
    last_user_agent: string;
    previous_ips: string[];
    previous_user_agents: string[];
    created_at: string;
    updated_at: string;
}

export default UserMetrics;