import React, {useEffect} from "react"
import UserMetrics from "../../types/metricsTypes";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import hrFileSize from "../../utils/hrFileSize";
import PageLoader from "../PageLoader";

function FileManagerUserMetrics(){
    const [metrics, setMetrics] = React.useState<UserMetrics[]>([])

    useEffect(() => {
        fetch("/metrics")
            .then(res => res.json())
            .then(setMetrics)
    }, []);

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Delivered Media</TableCell>
                        <TableCell>Delivered Data</TableCell>
                        <TableCell>Delivered Requests 2xx</TableCell>
                        <TableCell>Delivered Requests 3xx</TableCell>
                        <TableCell>Delivered Requests 4xx</TableCell>
                        <TableCell>Delivered Requests 5xx</TableCell>
                        <TableCell>Last IP</TableCell>
                        <TableCell>Last User Agent</TableCell>
                        <TableCell>Last Update</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody hidden={metrics.length === 0}>
                    {metrics.map((metric) => (
                        <TableRow key={metric.username}>
                            <TableCell>{metric.username}</TableCell>
                            <TableCell>{metric.delivered_media}</TableCell>
                            <TableCell>{hrFileSize(metric.delivered_bytes)}</TableCell>
                            <TableCell>{metric.delivered_requests_2xx}</TableCell>
                            <TableCell>{metric.delivered_requests_3xx}</TableCell>
                            <TableCell>{metric.delivered_requests_4xx}</TableCell>
                            <TableCell>{metric.delivered_requests_5xx}</TableCell>
                            <TableCell>{metric.last_ip}</TableCell>
                            <TableCell>{metric.last_user_agent}</TableCell>
                            <TableCell>{(new Date(metric.updated_at)).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {metrics.length === 0 && <PageLoader />}
        </>
    )
}

export default FileManagerUserMetrics