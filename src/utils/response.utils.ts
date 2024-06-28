/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express'

/**
 * Convienience function for sending responses.
 */
export const sendResponse = (res: Response, code: number, message?: string, data: any = {}) => {
    res.status(code).json({
        success: isCodeSuccessful(code),
        message,
        result: data,
    })
}

const isCodeSuccessful = (code: number) => code >= 200 && code < 300
