import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { sessionDetail } from '../medical-agent/[sessionId]/page'
import { Button } from '@/components/ui/button'
import moment from 'moment';
import ViewReportDialog from './ViewReportDialog';

type Props={
    HistoryList:sessionDetail[]
}

function HistoryTable({HistoryList}:Props) {
  const [showAll, setShowAll] = useState(false);
  const visibleHistory = showAll ? HistoryList : HistoryList.slice(0, 5);

  return (
    <div>
      <Table>
  <TableCaption>Previous Consultations Report</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead >AI Medical Specialist</TableHead>
      <TableHead>Description</TableHead>
      <TableHead>Date</TableHead>
      <TableHead className="text-right">Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {visibleHistory.map((record:sessionDetail,index:number)=>(
        <TableRow key={record.sessionId || index}>
      <TableCell className="font-medium">{record.selectedDoctor.specialist}</TableCell>
      <TableCell>{record.notes}</TableCell>
      <TableCell>{moment(new Date(record.createdOn)).fromNow()}</TableCell>
      <TableCell className="text-right"><ViewReportDialog record={record}/></TableCell>
    </TableRow>
    ))}

  </TableBody>
</Table>
      {HistoryList.length > 5 && (
        <div className='text-center mt-4'>
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show More (${HistoryList.length - 5} more)`}
          </Button>
        </div>
      )}
    </div>
  )
}

export default HistoryTable
