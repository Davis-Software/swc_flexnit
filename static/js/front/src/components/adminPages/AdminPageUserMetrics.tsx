import React, {useEffect} from "react"
import UserMetrics from "../../types/metricsTypes";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import hrFileSize from "../../utils/hrFileSize";
import PageLoader from "../PageLoader";
import SwcModal from "../SwcModal";

interface FileManagerUserMetricsTableRowProps {
    metric: UserMetrics
    rowClicked: (metric: UserMetrics) => void
    clickedRow?: UserMetrics | null
}
function FileManagerUserMetricsTableRow({metric, rowClicked, clickedRow}: FileManagerUserMetricsTableRowProps){
    return (
        <TableRow key={metric.username} onClick={() => rowClicked(metric)} hover>
            <TableCell>{metric.username}</TableCell>
            <TableCell>{metric.delivered_media}</TableCell>
            <TableCell>{hrFileSize(metric.delivered_bytes)}</TableCell>
            <TableCell>{metric.delivered_requests_2xx}</TableCell>
            <TableCell>{metric.delivered_requests_3xx}</TableCell>
            <TableCell>{metric.delivered_requests_4xx}</TableCell>
            <TableCell>{metric.delivered_requests_5xx}</TableCell>
            <TableCell>{(new Date(metric.updated_at)).toLocaleString()}</TableCell>
        </TableRow>
    )
}

function AdminPageUserMetrics(){
    const [metrics, setMetrics] = React.useState<UserMetrics[]>([])
    const [selectedMetric, setSelectedMetric] = React.useState<UserMetrics | null>(null)

    useEffect(() => {
        fetch("/metrics?parse")
            .then(res => res.json())
            .then(setMetrics)
    }, []);

    function sortMetrics(a: UserMetrics, b: UserMetrics){
        return a.updated_at > b.updated_at ? -1 : 1
    }

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
                        <TableCell>Last Update</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody hidden={metrics.length === 0}>
                    {metrics.sort(sortMetrics).map((metric) =>
                        <FileManagerUserMetricsTableRow key={metric.id} metric={metric} rowClicked={setSelectedMetric} />
                    )}
                </TableBody>
            </Table>
            {metrics.length === 0 && <PageLoader />}

            <SwcModal show={selectedMetric !== null} onHide={() => setSelectedMetric(null)}>
                {selectedMetric !== null && (
                    <>
                        <h3>Metrics of "{selectedMetric.username}"</h3>
                        <hr/>
                        <p>Delivered Media: {selectedMetric.delivered_media}</p>
                        <p>Delivered Data: {hrFileSize(selectedMetric.delivered_bytes)}</p>
                        <p>Delivered Requests 2xx: {selectedMetric.delivered_requests_2xx}</p>
                        <p>Delivered Requests 3xx: {selectedMetric.delivered_requests_3xx}</p>
                        <p>Delivered Requests 4xx: {selectedMetric.delivered_requests_4xx}</p>
                        <p>Delivered Requests 5xx: {selectedMetric.delivered_requests_5xx}</p>
                        <hr/>
                        <p>Delivered Titles</p>
                        <ul>
                            {selectedMetric.delivered_titles?.map((title, i) => <li key={i}>{title.title} ({title.type})</li>)}
                        </ul>
                        <hr/>
                        <p>Id: {selectedMetric.id}</p>
                        <p>Created At: {(new Date(selectedMetric.created_at)).toLocaleString()}</p>
                        <p>Updated At: {(new Date(selectedMetric.updated_at)).toLocaleString()}</p>
                        <hr/>
                        <p>Last IP: {selectedMetric.last_ip}</p>
                        <p>Last User Agent: {selectedMetric.last_user_agent}</p>
                        <p>Last IPs:</p>
                        <ul>
                            {selectedMetric.previous_ips.map((ip) => <li key={ip}>{ip}</li>)}
                        </ul>
                        <p>Last User Agents:</p>
                        <ul>
                            {selectedMetric.previous_user_agents.map((ua) => <li key={ua}>{ua}</li>)}
                        </ul>
                    </>
                )}
            </SwcModal>
        </>
    )
}

export default AdminPageUserMetrics