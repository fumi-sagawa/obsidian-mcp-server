import { z } from 'zod';

/**
 * get_server_status ツールの入力スキーマ
 * このツールは引数を取らないため、空のオブジェクトを受け付ける
 */
export const getServerStatusArgsSchema = {};

export type GetServerStatusArgs = {};