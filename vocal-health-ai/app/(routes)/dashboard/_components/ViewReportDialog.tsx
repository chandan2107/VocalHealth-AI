'use client'
import React, { useContext } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { sessionDetail } from '../medical-agent/[sessionId]/page'
import moment from 'moment'
import { useUser } from '@clerk/nextjs'
import { UserDetailCotext } from '@/context/UserDetailContext'

type props={
    record:sessionDetail
}
function ViewReportDialog({record}:props) {
  const report:any = record?.report || {}
  const { user } = useUser()
  const { UserDetail } = useContext(UserDetailCotext) || {}
  const displayUserName = UserDetail?.name || user?.fullName || report?.user || 'Anonymous'

  const toDisplayList = (val:any) => {
    if (!val) return '-'
    if (Array.isArray(val)) return val.length ? val.join(', ') : '-'
    return String(val)
  }

  const handleDownloadPdf = async () => {
    // @ts-ignore - provided by runtime after install
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 18
    let y = 16

    const fixSpacedLetters = (input:string) => {
      // Join patterns like "a l t e r e d" → "altered"
      return (input || '').replace(/\b(?:[A-Za-z]\s){2,}[A-Za-z]\b/g, (m) => m.replace(/\s+/g, ''))
    }
    const sanitize = (input:string) => {
      let out = (input || '')
        .toString()
        .normalize('NFKC')
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      out = fixSpacedLetters(out)
      return out
    }
    const hardWrapLongTokens = (input:string, maxTokenLen=34) => {
      return input.split(' ').map(tok => {
        if (tok.length <= maxTokenLen) return tok
        const chunks:string[] = []
        for (let i=0;i<tok.length;i+=maxTokenLen) {
          chunks.push(tok.slice(i, i+maxTokenLen))
        }
        return chunks.join(' ')
      }).join(' ')
    }

    // Draw page border
    doc.setDrawColor(200)
    doc.rect(margin - 8, margin - 8, pageWidth - (margin - 8) * 2, pageHeight - (margin - 8) * 2)

    const ensureSpace = (needed:number) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage()
        y = margin
        // redraw border on new page
        doc.setDrawColor(200)
        doc.rect(margin - 8, margin - 8, pageWidth - (margin - 8) * 2, pageHeight - (margin - 8) * 2)
      }
    }

    const addHeading = (text:string) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      ensureSpace(12)
      const safe = sanitize(text || '')
      doc.text(safe, margin, y, { maxWidth: pageWidth - margin * 2 })
      y += 8
    }
    const addField = (label:string, value:string, opts?:{ paragraph?: boolean }) => {
      // Draw label
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      const labelText = sanitize(`${label}:`)
      ensureSpace(10)
      doc.text(labelText, margin, y)

      // Prepare value
      doc.setFont('helvetica', 'normal')
      let render = sanitize(value || '-')

      // Compute single-line available width to keep on same line
      const labelWidth = doc.getTextWidth(labelText) + 2
      const startX = margin + labelWidth
      const availableWidth = pageWidth - startX - margin

      const shouldParagraph = !!opts?.paragraph || doc.getTextWidth(render) > availableWidth

      if (shouldParagraph) {
        // Move to next line and render paragraph full width
        y += 6
        const paraWidth = pageWidth - margin * 2
        const safePara = hardWrapLongTokens(render, 34)
        const lines = doc.splitTextToSize(safePara, paraWidth)
        ensureSpace((lines as string[]).length * 6 + 4)
        doc.text(lines as string[], margin, y, { maxWidth: paraWidth, lineHeightFactor: 1.4 })
        y += (lines as string[]).length * 6 + 2
        return
      }

      // Draw value on same baseline/line as label
      // Truncate to keep on one line within the border
      const ellipsis = '…'
      const ellipsisWidth = doc.getTextWidth(ellipsis)
      let textWidth = doc.getTextWidth(render)
      if (textWidth > availableWidth) {
        while (render.length > 0 && textWidth > (availableWidth - ellipsisWidth)) {
          render = render.slice(0, -1)
          textWidth = doc.getTextWidth(render)
        }
        render = render + ellipsis
      }
      doc.text(render, startX, y, { maxWidth: availableWidth })

      // Advance line
      y += 8
    }

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('VocalHealth AI - Medical Report', margin, y)
    y += 10

    // Session Info
    addHeading('Session Info')
    addField('Session ID', String(report.sessionId || record.sessionId || '-'))
    addField('Agent', String(report.agent || record?.selectedDoctor?.specialist || '-'))
    addField('User', String(displayUserName))
    // Only date and time in consistent format
    const ts = report?.timestamp || record?.createdOn
    const tsDisplay = ts ? moment(new Date(ts)).format('YYYY-MM-DD HH:mm') : '-'
    addField('Timestamp', tsDisplay)

    // Clinical Details
    addHeading('Clinical Details')
    addField('Chief Complaint', String(report.chiefComplaint || '-'))
    addField('Summary', String(report.summary || '-'), { paragraph: true })
    addField('Symptoms', toDisplayList(report.symptoms) as string)
    addField('Duration', String(report.duration || '-'))
    addField('Severity', String(report.severity || '-'))
    addField('Medications Mentioned ', toDisplayList(report.medicationsMentioned) as string, { paragraph: true })
    addField('Recommendations', toDisplayList(report.recommendations) as string, { paragraph: true })

    doc.save(`medical-report-${report.sessionId || record.sessionId || 'session'}.pdf`)
  }

  return (
    <div>
      <Dialog>
  <DialogTrigger>
    <Button variant={'outline'} size={'sm'}>View Report</Button>
  </DialogTrigger>
  <DialogContent className='w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto'>
    <DialogHeader>
      <DialogTitle asChild>
        <h2 className='text-center text-4xl'>AI Medical Voice Agent Report</h2>
      </DialogTitle>
      <DialogDescription asChild>
        <div className='mt-6 space-y-6'>
          <div>
            <h3 className='font-bold text-blue-500 text-lg'>Session Info</h3>
            <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-2'>
              <p><span className='font-bold'>Session ID:</span> {report?.sessionId || record.sessionId || '-'}</p>
              <p><span className='font-bold'>Agent:</span> {report?.agent || record?.selectedDoctor?.specialist || '-'}</p>
              <p><span className='font-bold'>User:</span> {displayUserName}</p>
              <p><span className='font-bold'>Consult Date:</span> {moment(new Date(report?.timestamp || record?.createdOn || new Date())).format('YYYY-MM-DD HH:mm')}</p>
            </div>
          </div>

          <div className='space-y-2'>
            <h3 className='font-bold text-blue-500 text-lg'>Chief Complaint</h3>
            <p>{report?.chiefComplaint || '-'}</p>
          </div>

          <div className='space-y-2'>
            <h3 className='font-bold text-blue-500 text-lg'>Summary</h3>
            <p className='leading-relaxed'>{report?.summary || '-'}</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <h3 className='font-bold text-blue-500 text-lg'>Symptoms</h3>
              <p>{Array.isArray(report?.symptoms) ? report.symptoms.join(', ') : (report?.symptoms || '-')}</p>
            </div>
            <div className='space-y-1'>
              <h3 className='font-bold text-blue-500 text-lg'>Duration</h3>
              <p>{report?.duration || '-'}</p>
            </div>
            <div className='space-y-1'>
              <h3 className='font-bold text-blue-500 text-lg'>Severity</h3>
              <p>{report?.severity || '-'}</p>
            </div>
            <div className='space-y-1'>
              <h3 className='font-bold text-blue-500 text-lg'>Medications Mentioned</h3>
              <p>{Array.isArray(report?.medicationsMentioned) ? report.medicationsMentioned.join(', ') : (report?.medicationsMentioned || '-')}</p>
            </div>
            <div className='space-y-1 md:col-span-2'>
              <h3 className='font-bold text-blue-500 text-lg'>Recommendations</h3>
              <p>{Array.isArray(report?.recommendations) ? report.recommendations.join(', ') : (report?.recommendations || '-')}</p>
            </div>
          </div>

          <div className='pt-2 flex justify-end'>
            <Button onClick={handleDownloadPdf}>Download PDF</Button>
          </div>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </div>
  )
}

export default ViewReportDialog
