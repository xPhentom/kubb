import type { Pet } from '../../models'

/**
 * @description Invalid tag value
 */
export type FindPetsByTags400 = any | null

export type FindPetsByTagsQueryParams = {
  /**
   * @description Tags to filter by
   * @type array | undefined
   */
  tags?: string[]
  /**
   * @description to request with required page number or pagination
   * @type string | undefined
   */
  page?: string
  /**
   * @description to request with required page size
   * @type string | undefined
   */
  pageSize?: string
}

/**
 * @description successful operation
 */
export type FindPetsByTagsQueryResponse = Pet[]
export namespace FindPetsByTagsQuery {
  export type Response = FindPetsByTagsQueryResponse
  export type QueryParams = FindPetsByTagsQueryParams
  export type Errors = FindPetsByTags400
}
