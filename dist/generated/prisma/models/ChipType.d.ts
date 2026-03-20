import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ChipType
 *
 */
export type ChipTypeModel = runtime.Types.Result.DefaultSelection<Prisma.$ChipTypePayload>;
export type AggregateChipType = {
    _count: ChipTypeCountAggregateOutputType | null;
    _avg: ChipTypeAvgAggregateOutputType | null;
    _sum: ChipTypeSumAggregateOutputType | null;
    _min: ChipTypeMinAggregateOutputType | null;
    _max: ChipTypeMaxAggregateOutputType | null;
};
export type ChipTypeAvgAggregateOutputType = {
    id: number | null;
    multiplier: number | null;
    maxUsesPerSeason: number | null;
    effectWindowMatches: number | null;
};
export type ChipTypeSumAggregateOutputType = {
    id: number | null;
    multiplier: number | null;
    maxUsesPerSeason: number | null;
    effectWindowMatches: number | null;
};
export type ChipTypeMinAggregateOutputType = {
    id: number | null;
    code: $Enums.ChipCode | null;
    name: string | null;
    description: string | null;
    multiplier: number | null;
    maxUsesPerSeason: number | null;
    effectWindowMatches: number | null;
    requiresBottomHalf: boolean | null;
    usesSecondaryTeamScore: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChipTypeMaxAggregateOutputType = {
    id: number | null;
    code: $Enums.ChipCode | null;
    name: string | null;
    description: string | null;
    multiplier: number | null;
    maxUsesPerSeason: number | null;
    effectWindowMatches: number | null;
    requiresBottomHalf: boolean | null;
    usesSecondaryTeamScore: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChipTypeCountAggregateOutputType = {
    id: number;
    code: number;
    name: number;
    description: number;
    multiplier: number;
    maxUsesPerSeason: number;
    effectWindowMatches: number;
    requiresBottomHalf: number;
    usesSecondaryTeamScore: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ChipTypeAvgAggregateInputType = {
    id?: true;
    multiplier?: true;
    maxUsesPerSeason?: true;
    effectWindowMatches?: true;
};
export type ChipTypeSumAggregateInputType = {
    id?: true;
    multiplier?: true;
    maxUsesPerSeason?: true;
    effectWindowMatches?: true;
};
export type ChipTypeMinAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    multiplier?: true;
    maxUsesPerSeason?: true;
    effectWindowMatches?: true;
    requiresBottomHalf?: true;
    usesSecondaryTeamScore?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChipTypeMaxAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    multiplier?: true;
    maxUsesPerSeason?: true;
    effectWindowMatches?: true;
    requiresBottomHalf?: true;
    usesSecondaryTeamScore?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChipTypeCountAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    multiplier?: true;
    maxUsesPerSeason?: true;
    effectWindowMatches?: true;
    requiresBottomHalf?: true;
    usesSecondaryTeamScore?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ChipTypeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ChipType to aggregate.
     */
    where?: Prisma.ChipTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipTypes to fetch.
     */
    orderBy?: Prisma.ChipTypeOrderByWithRelationInput | Prisma.ChipTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ChipTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipTypes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ChipTypes
    **/
    _count?: true | ChipTypeCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: ChipTypeAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: ChipTypeSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ChipTypeMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ChipTypeMaxAggregateInputType;
};
export type GetChipTypeAggregateType<T extends ChipTypeAggregateArgs> = {
    [P in keyof T & keyof AggregateChipType]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateChipType[P]> : Prisma.GetScalarType<T[P], AggregateChipType[P]>;
};
export type ChipTypeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChipTypeWhereInput;
    orderBy?: Prisma.ChipTypeOrderByWithAggregationInput | Prisma.ChipTypeOrderByWithAggregationInput[];
    by: Prisma.ChipTypeScalarFieldEnum[] | Prisma.ChipTypeScalarFieldEnum;
    having?: Prisma.ChipTypeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ChipTypeCountAggregateInputType | true;
    _avg?: ChipTypeAvgAggregateInputType;
    _sum?: ChipTypeSumAggregateInputType;
    _min?: ChipTypeMinAggregateInputType;
    _max?: ChipTypeMaxAggregateInputType;
};
export type ChipTypeGroupByOutputType = {
    id: number;
    code: $Enums.ChipCode;
    name: string;
    description: string | null;
    multiplier: number;
    maxUsesPerSeason: number;
    effectWindowMatches: number;
    requiresBottomHalf: boolean;
    usesSecondaryTeamScore: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: ChipTypeCountAggregateOutputType | null;
    _avg: ChipTypeAvgAggregateOutputType | null;
    _sum: ChipTypeSumAggregateOutputType | null;
    _min: ChipTypeMinAggregateOutputType | null;
    _max: ChipTypeMaxAggregateOutputType | null;
};
type GetChipTypeGroupByPayload<T extends ChipTypeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ChipTypeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ChipTypeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ChipTypeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ChipTypeGroupByOutputType[P]>;
}>>;
export type ChipTypeWhereInput = {
    AND?: Prisma.ChipTypeWhereInput | Prisma.ChipTypeWhereInput[];
    OR?: Prisma.ChipTypeWhereInput[];
    NOT?: Prisma.ChipTypeWhereInput | Prisma.ChipTypeWhereInput[];
    id?: Prisma.IntFilter<"ChipType"> | number;
    code?: Prisma.EnumChipCodeFilter<"ChipType"> | $Enums.ChipCode;
    name?: Prisma.StringFilter<"ChipType"> | string;
    description?: Prisma.StringNullableFilter<"ChipType"> | string | null;
    multiplier?: Prisma.FloatFilter<"ChipType"> | number;
    maxUsesPerSeason?: Prisma.IntFilter<"ChipType"> | number;
    effectWindowMatches?: Prisma.IntFilter<"ChipType"> | number;
    requiresBottomHalf?: Prisma.BoolFilter<"ChipType"> | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFilter<"ChipType"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ChipType"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChipType"> | Date | string;
    chipPlays?: Prisma.ChipPlayListRelationFilter;
};
export type ChipTypeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    multiplier?: Prisma.SortOrder;
    maxUsesPerSeason?: Prisma.SortOrder;
    effectWindowMatches?: Prisma.SortOrder;
    requiresBottomHalf?: Prisma.SortOrder;
    usesSecondaryTeamScore?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    chipPlays?: Prisma.ChipPlayOrderByRelationAggregateInput;
};
export type ChipTypeWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    code?: $Enums.ChipCode;
    AND?: Prisma.ChipTypeWhereInput | Prisma.ChipTypeWhereInput[];
    OR?: Prisma.ChipTypeWhereInput[];
    NOT?: Prisma.ChipTypeWhereInput | Prisma.ChipTypeWhereInput[];
    name?: Prisma.StringFilter<"ChipType"> | string;
    description?: Prisma.StringNullableFilter<"ChipType"> | string | null;
    multiplier?: Prisma.FloatFilter<"ChipType"> | number;
    maxUsesPerSeason?: Prisma.IntFilter<"ChipType"> | number;
    effectWindowMatches?: Prisma.IntFilter<"ChipType"> | number;
    requiresBottomHalf?: Prisma.BoolFilter<"ChipType"> | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFilter<"ChipType"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ChipType"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChipType"> | Date | string;
    chipPlays?: Prisma.ChipPlayListRelationFilter;
}, "id" | "code">;
export type ChipTypeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    multiplier?: Prisma.SortOrder;
    maxUsesPerSeason?: Prisma.SortOrder;
    effectWindowMatches?: Prisma.SortOrder;
    requiresBottomHalf?: Prisma.SortOrder;
    usesSecondaryTeamScore?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ChipTypeCountOrderByAggregateInput;
    _avg?: Prisma.ChipTypeAvgOrderByAggregateInput;
    _max?: Prisma.ChipTypeMaxOrderByAggregateInput;
    _min?: Prisma.ChipTypeMinOrderByAggregateInput;
    _sum?: Prisma.ChipTypeSumOrderByAggregateInput;
};
export type ChipTypeScalarWhereWithAggregatesInput = {
    AND?: Prisma.ChipTypeScalarWhereWithAggregatesInput | Prisma.ChipTypeScalarWhereWithAggregatesInput[];
    OR?: Prisma.ChipTypeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ChipTypeScalarWhereWithAggregatesInput | Prisma.ChipTypeScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"ChipType"> | number;
    code?: Prisma.EnumChipCodeWithAggregatesFilter<"ChipType"> | $Enums.ChipCode;
    name?: Prisma.StringWithAggregatesFilter<"ChipType"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"ChipType"> | string | null;
    multiplier?: Prisma.FloatWithAggregatesFilter<"ChipType"> | number;
    maxUsesPerSeason?: Prisma.IntWithAggregatesFilter<"ChipType"> | number;
    effectWindowMatches?: Prisma.IntWithAggregatesFilter<"ChipType"> | number;
    requiresBottomHalf?: Prisma.BoolWithAggregatesFilter<"ChipType"> | boolean;
    usesSecondaryTeamScore?: Prisma.BoolWithAggregatesFilter<"ChipType"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ChipType"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ChipType"> | Date | string;
};
export type ChipTypeCreateInput = {
    code: $Enums.ChipCode;
    name: string;
    description?: string | null;
    multiplier: number;
    maxUsesPerSeason: number;
    effectWindowMatches?: number;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    chipPlays?: Prisma.ChipPlayCreateNestedManyWithoutChipTypeInput;
};
export type ChipTypeUncheckedCreateInput = {
    id?: number;
    code: $Enums.ChipCode;
    name: string;
    description?: string | null;
    multiplier: number;
    maxUsesPerSeason: number;
    effectWindowMatches?: number;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    chipPlays?: Prisma.ChipPlayUncheckedCreateNestedManyWithoutChipTypeInput;
};
export type ChipTypeUpdateInput = {
    code?: Prisma.EnumChipCodeFieldUpdateOperationsInput | $Enums.ChipCode;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    multiplier?: Prisma.FloatFieldUpdateOperationsInput | number;
    maxUsesPerSeason?: Prisma.IntFieldUpdateOperationsInput | number;
    effectWindowMatches?: Prisma.IntFieldUpdateOperationsInput | number;
    requiresBottomHalf?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    chipPlays?: Prisma.ChipPlayUpdateManyWithoutChipTypeNestedInput;
};
export type ChipTypeUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    code?: Prisma.EnumChipCodeFieldUpdateOperationsInput | $Enums.ChipCode;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    multiplier?: Prisma.FloatFieldUpdateOperationsInput | number;
    maxUsesPerSeason?: Prisma.IntFieldUpdateOperationsInput | number;
    effectWindowMatches?: Prisma.IntFieldUpdateOperationsInput | number;
    requiresBottomHalf?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    chipPlays?: Prisma.ChipPlayUncheckedUpdateManyWithoutChipTypeNestedInput;
};
export type ChipTypeCreateManyInput = {
    id?: number;
    code: $Enums.ChipCode;
    name: string;
    description?: string | null;
    multiplier: number;
    maxUsesPerSeason: number;
    effectWindowMatches?: number;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipTypeUpdateManyMutationInput = {
    code?: Prisma.EnumChipCodeFieldUpdateOperationsInput | $Enums.ChipCode;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    multiplier?: Prisma.FloatFieldUpdateOperationsInput | number;
    maxUsesPerSeason?: Prisma.IntFieldUpdateOperationsInput | number;
    effectWindowMatches?: Prisma.IntFieldUpdateOperationsInput | number;
    requiresBottomHalf?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipTypeUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    code?: Prisma.EnumChipCodeFieldUpdateOperationsInput | $Enums.ChipCode;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    multiplier?: Prisma.FloatFieldUpdateOperationsInput | number;
    maxUsesPerSeason?: Prisma.IntFieldUpdateOperationsInput | number;
    effectWindowMatches?: Prisma.IntFieldUpdateOperationsInput | number;
    requiresBottomHalf?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipTypeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    multiplier?: Prisma.SortOrder;
    maxUsesPerSeason?: Prisma.SortOrder;
    effectWindowMatches?: Prisma.SortOrder;
    requiresBottomHalf?: Prisma.SortOrder;
    usesSecondaryTeamScore?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChipTypeAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    multiplier?: Prisma.SortOrder;
    maxUsesPerSeason?: Prisma.SortOrder;
    effectWindowMatches?: Prisma.SortOrder;
};
export type ChipTypeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    multiplier?: Prisma.SortOrder;
    maxUsesPerSeason?: Prisma.SortOrder;
    effectWindowMatches?: Prisma.SortOrder;
    requiresBottomHalf?: Prisma.SortOrder;
    usesSecondaryTeamScore?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChipTypeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    multiplier?: Prisma.SortOrder;
    maxUsesPerSeason?: Prisma.SortOrder;
    effectWindowMatches?: Prisma.SortOrder;
    requiresBottomHalf?: Prisma.SortOrder;
    usesSecondaryTeamScore?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChipTypeSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    multiplier?: Prisma.SortOrder;
    maxUsesPerSeason?: Prisma.SortOrder;
    effectWindowMatches?: Prisma.SortOrder;
};
export type ChipTypeScalarRelationFilter = {
    is?: Prisma.ChipTypeWhereInput;
    isNot?: Prisma.ChipTypeWhereInput;
};
export type EnumChipCodeFieldUpdateOperationsInput = {
    set?: $Enums.ChipCode;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type ChipTypeCreateNestedOneWithoutChipPlaysInput = {
    create?: Prisma.XOR<Prisma.ChipTypeCreateWithoutChipPlaysInput, Prisma.ChipTypeUncheckedCreateWithoutChipPlaysInput>;
    connectOrCreate?: Prisma.ChipTypeCreateOrConnectWithoutChipPlaysInput;
    connect?: Prisma.ChipTypeWhereUniqueInput;
};
export type ChipTypeUpdateOneRequiredWithoutChipPlaysNestedInput = {
    create?: Prisma.XOR<Prisma.ChipTypeCreateWithoutChipPlaysInput, Prisma.ChipTypeUncheckedCreateWithoutChipPlaysInput>;
    connectOrCreate?: Prisma.ChipTypeCreateOrConnectWithoutChipPlaysInput;
    upsert?: Prisma.ChipTypeUpsertWithoutChipPlaysInput;
    connect?: Prisma.ChipTypeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ChipTypeUpdateToOneWithWhereWithoutChipPlaysInput, Prisma.ChipTypeUpdateWithoutChipPlaysInput>, Prisma.ChipTypeUncheckedUpdateWithoutChipPlaysInput>;
};
export type ChipTypeCreateWithoutChipPlaysInput = {
    code: $Enums.ChipCode;
    name: string;
    description?: string | null;
    multiplier: number;
    maxUsesPerSeason: number;
    effectWindowMatches?: number;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipTypeUncheckedCreateWithoutChipPlaysInput = {
    id?: number;
    code: $Enums.ChipCode;
    name: string;
    description?: string | null;
    multiplier: number;
    maxUsesPerSeason: number;
    effectWindowMatches?: number;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipTypeCreateOrConnectWithoutChipPlaysInput = {
    where: Prisma.ChipTypeWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChipTypeCreateWithoutChipPlaysInput, Prisma.ChipTypeUncheckedCreateWithoutChipPlaysInput>;
};
export type ChipTypeUpsertWithoutChipPlaysInput = {
    update: Prisma.XOR<Prisma.ChipTypeUpdateWithoutChipPlaysInput, Prisma.ChipTypeUncheckedUpdateWithoutChipPlaysInput>;
    create: Prisma.XOR<Prisma.ChipTypeCreateWithoutChipPlaysInput, Prisma.ChipTypeUncheckedCreateWithoutChipPlaysInput>;
    where?: Prisma.ChipTypeWhereInput;
};
export type ChipTypeUpdateToOneWithWhereWithoutChipPlaysInput = {
    where?: Prisma.ChipTypeWhereInput;
    data: Prisma.XOR<Prisma.ChipTypeUpdateWithoutChipPlaysInput, Prisma.ChipTypeUncheckedUpdateWithoutChipPlaysInput>;
};
export type ChipTypeUpdateWithoutChipPlaysInput = {
    code?: Prisma.EnumChipCodeFieldUpdateOperationsInput | $Enums.ChipCode;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    multiplier?: Prisma.FloatFieldUpdateOperationsInput | number;
    maxUsesPerSeason?: Prisma.IntFieldUpdateOperationsInput | number;
    effectWindowMatches?: Prisma.IntFieldUpdateOperationsInput | number;
    requiresBottomHalf?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipTypeUncheckedUpdateWithoutChipPlaysInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    code?: Prisma.EnumChipCodeFieldUpdateOperationsInput | $Enums.ChipCode;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    multiplier?: Prisma.FloatFieldUpdateOperationsInput | number;
    maxUsesPerSeason?: Prisma.IntFieldUpdateOperationsInput | number;
    effectWindowMatches?: Prisma.IntFieldUpdateOperationsInput | number;
    requiresBottomHalf?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usesSecondaryTeamScore?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type ChipTypeCountOutputType
 */
export type ChipTypeCountOutputType = {
    chipPlays: number;
};
export type ChipTypeCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    chipPlays?: boolean | ChipTypeCountOutputTypeCountChipPlaysArgs;
};
/**
 * ChipTypeCountOutputType without action
 */
export type ChipTypeCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipTypeCountOutputType
     */
    select?: Prisma.ChipTypeCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ChipTypeCountOutputType without action
 */
export type ChipTypeCountOutputTypeCountChipPlaysArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChipPlayWhereInput;
};
export type ChipTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    multiplier?: boolean;
    maxUsesPerSeason?: boolean;
    effectWindowMatches?: boolean;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    chipPlays?: boolean | Prisma.ChipType$chipPlaysArgs<ExtArgs>;
    _count?: boolean | Prisma.ChipTypeCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chipType"]>;
export type ChipTypeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    multiplier?: boolean;
    maxUsesPerSeason?: boolean;
    effectWindowMatches?: boolean;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["chipType"]>;
export type ChipTypeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    multiplier?: boolean;
    maxUsesPerSeason?: boolean;
    effectWindowMatches?: boolean;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["chipType"]>;
export type ChipTypeSelectScalar = {
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    multiplier?: boolean;
    maxUsesPerSeason?: boolean;
    effectWindowMatches?: boolean;
    requiresBottomHalf?: boolean;
    usesSecondaryTeamScore?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ChipTypeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "name" | "description" | "multiplier" | "maxUsesPerSeason" | "effectWindowMatches" | "requiresBottomHalf" | "usesSecondaryTeamScore" | "createdAt" | "updatedAt", ExtArgs["result"]["chipType"]>;
export type ChipTypeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    chipPlays?: boolean | Prisma.ChipType$chipPlaysArgs<ExtArgs>;
    _count?: boolean | Prisma.ChipTypeCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ChipTypeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ChipTypeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ChipTypePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ChipType";
    objects: {
        chipPlays: Prisma.$ChipPlayPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        code: $Enums.ChipCode;
        name: string;
        description: string | null;
        multiplier: number;
        maxUsesPerSeason: number;
        effectWindowMatches: number;
        requiresBottomHalf: boolean;
        usesSecondaryTeamScore: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["chipType"]>;
    composites: {};
};
export type ChipTypeGetPayload<S extends boolean | null | undefined | ChipTypeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ChipTypePayload, S>;
export type ChipTypeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ChipTypeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ChipTypeCountAggregateInputType | true;
};
export interface ChipTypeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ChipType'];
        meta: {
            name: 'ChipType';
        };
    };
    /**
     * Find zero or one ChipType that matches the filter.
     * @param {ChipTypeFindUniqueArgs} args - Arguments to find a ChipType
     * @example
     * // Get one ChipType
     * const chipType = await prisma.chipType.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChipTypeFindUniqueArgs>(args: Prisma.SelectSubset<T, ChipTypeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ChipType that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChipTypeFindUniqueOrThrowArgs} args - Arguments to find a ChipType
     * @example
     * // Get one ChipType
     * const chipType = await prisma.chipType.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChipTypeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ChipTypeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ChipType that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipTypeFindFirstArgs} args - Arguments to find a ChipType
     * @example
     * // Get one ChipType
     * const chipType = await prisma.chipType.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChipTypeFindFirstArgs>(args?: Prisma.SelectSubset<T, ChipTypeFindFirstArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ChipType that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipTypeFindFirstOrThrowArgs} args - Arguments to find a ChipType
     * @example
     * // Get one ChipType
     * const chipType = await prisma.chipType.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChipTypeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ChipTypeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ChipTypes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipTypeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChipTypes
     * const chipTypes = await prisma.chipType.findMany()
     *
     * // Get first 10 ChipTypes
     * const chipTypes = await prisma.chipType.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const chipTypeWithIdOnly = await prisma.chipType.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ChipTypeFindManyArgs>(args?: Prisma.SelectSubset<T, ChipTypeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ChipType.
     * @param {ChipTypeCreateArgs} args - Arguments to create a ChipType.
     * @example
     * // Create one ChipType
     * const ChipType = await prisma.chipType.create({
     *   data: {
     *     // ... data to create a ChipType
     *   }
     * })
     *
     */
    create<T extends ChipTypeCreateArgs>(args: Prisma.SelectSubset<T, ChipTypeCreateArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ChipTypes.
     * @param {ChipTypeCreateManyArgs} args - Arguments to create many ChipTypes.
     * @example
     * // Create many ChipTypes
     * const chipType = await prisma.chipType.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ChipTypeCreateManyArgs>(args?: Prisma.SelectSubset<T, ChipTypeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ChipTypes and returns the data saved in the database.
     * @param {ChipTypeCreateManyAndReturnArgs} args - Arguments to create many ChipTypes.
     * @example
     * // Create many ChipTypes
     * const chipType = await prisma.chipType.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ChipTypes and only return the `id`
     * const chipTypeWithIdOnly = await prisma.chipType.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ChipTypeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ChipTypeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ChipType.
     * @param {ChipTypeDeleteArgs} args - Arguments to delete one ChipType.
     * @example
     * // Delete one ChipType
     * const ChipType = await prisma.chipType.delete({
     *   where: {
     *     // ... filter to delete one ChipType
     *   }
     * })
     *
     */
    delete<T extends ChipTypeDeleteArgs>(args: Prisma.SelectSubset<T, ChipTypeDeleteArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ChipType.
     * @param {ChipTypeUpdateArgs} args - Arguments to update one ChipType.
     * @example
     * // Update one ChipType
     * const chipType = await prisma.chipType.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ChipTypeUpdateArgs>(args: Prisma.SelectSubset<T, ChipTypeUpdateArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ChipTypes.
     * @param {ChipTypeDeleteManyArgs} args - Arguments to filter ChipTypes to delete.
     * @example
     * // Delete a few ChipTypes
     * const { count } = await prisma.chipType.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ChipTypeDeleteManyArgs>(args?: Prisma.SelectSubset<T, ChipTypeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ChipTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipTypeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChipTypes
     * const chipType = await prisma.chipType.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ChipTypeUpdateManyArgs>(args: Prisma.SelectSubset<T, ChipTypeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ChipTypes and returns the data updated in the database.
     * @param {ChipTypeUpdateManyAndReturnArgs} args - Arguments to update many ChipTypes.
     * @example
     * // Update many ChipTypes
     * const chipType = await prisma.chipType.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ChipTypes and only return the `id`
     * const chipTypeWithIdOnly = await prisma.chipType.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ChipTypeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ChipTypeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ChipType.
     * @param {ChipTypeUpsertArgs} args - Arguments to update or create a ChipType.
     * @example
     * // Update or create a ChipType
     * const chipType = await prisma.chipType.upsert({
     *   create: {
     *     // ... data to create a ChipType
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChipType we want to update
     *   }
     * })
     */
    upsert<T extends ChipTypeUpsertArgs>(args: Prisma.SelectSubset<T, ChipTypeUpsertArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ChipTypes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipTypeCountArgs} args - Arguments to filter ChipTypes to count.
     * @example
     * // Count the number of ChipTypes
     * const count = await prisma.chipType.count({
     *   where: {
     *     // ... the filter for the ChipTypes we want to count
     *   }
     * })
    **/
    count<T extends ChipTypeCountArgs>(args?: Prisma.Subset<T, ChipTypeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ChipTypeCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ChipType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipTypeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChipTypeAggregateArgs>(args: Prisma.Subset<T, ChipTypeAggregateArgs>): Prisma.PrismaPromise<GetChipTypeAggregateType<T>>;
    /**
     * Group by ChipType.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipTypeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends ChipTypeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ChipTypeGroupByArgs['orderBy'];
    } : {
        orderBy?: ChipTypeGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ChipTypeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChipTypeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ChipType model
     */
    readonly fields: ChipTypeFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ChipType.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ChipTypeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    chipPlays<T extends Prisma.ChipType$chipPlaysArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ChipType$chipPlaysArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the ChipType model
 */
export interface ChipTypeFieldRefs {
    readonly id: Prisma.FieldRef<"ChipType", 'Int'>;
    readonly code: Prisma.FieldRef<"ChipType", 'ChipCode'>;
    readonly name: Prisma.FieldRef<"ChipType", 'String'>;
    readonly description: Prisma.FieldRef<"ChipType", 'String'>;
    readonly multiplier: Prisma.FieldRef<"ChipType", 'Float'>;
    readonly maxUsesPerSeason: Prisma.FieldRef<"ChipType", 'Int'>;
    readonly effectWindowMatches: Prisma.FieldRef<"ChipType", 'Int'>;
    readonly requiresBottomHalf: Prisma.FieldRef<"ChipType", 'Boolean'>;
    readonly usesSecondaryTeamScore: Prisma.FieldRef<"ChipType", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"ChipType", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ChipType", 'DateTime'>;
}
/**
 * ChipType findUnique
 */
export type ChipTypeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * Filter, which ChipType to fetch.
     */
    where: Prisma.ChipTypeWhereUniqueInput;
};
/**
 * ChipType findUniqueOrThrow
 */
export type ChipTypeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * Filter, which ChipType to fetch.
     */
    where: Prisma.ChipTypeWhereUniqueInput;
};
/**
 * ChipType findFirst
 */
export type ChipTypeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * Filter, which ChipType to fetch.
     */
    where?: Prisma.ChipTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipTypes to fetch.
     */
    orderBy?: Prisma.ChipTypeOrderByWithRelationInput | Prisma.ChipTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ChipTypes.
     */
    cursor?: Prisma.ChipTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipTypes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ChipTypes.
     */
    distinct?: Prisma.ChipTypeScalarFieldEnum | Prisma.ChipTypeScalarFieldEnum[];
};
/**
 * ChipType findFirstOrThrow
 */
export type ChipTypeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * Filter, which ChipType to fetch.
     */
    where?: Prisma.ChipTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipTypes to fetch.
     */
    orderBy?: Prisma.ChipTypeOrderByWithRelationInput | Prisma.ChipTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ChipTypes.
     */
    cursor?: Prisma.ChipTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipTypes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ChipTypes.
     */
    distinct?: Prisma.ChipTypeScalarFieldEnum | Prisma.ChipTypeScalarFieldEnum[];
};
/**
 * ChipType findMany
 */
export type ChipTypeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * Filter, which ChipTypes to fetch.
     */
    where?: Prisma.ChipTypeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipTypes to fetch.
     */
    orderBy?: Prisma.ChipTypeOrderByWithRelationInput | Prisma.ChipTypeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ChipTypes.
     */
    cursor?: Prisma.ChipTypeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipTypes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipTypes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ChipTypes.
     */
    distinct?: Prisma.ChipTypeScalarFieldEnum | Prisma.ChipTypeScalarFieldEnum[];
};
/**
 * ChipType create
 */
export type ChipTypeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * The data needed to create a ChipType.
     */
    data: Prisma.XOR<Prisma.ChipTypeCreateInput, Prisma.ChipTypeUncheckedCreateInput>;
};
/**
 * ChipType createMany
 */
export type ChipTypeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChipTypes.
     */
    data: Prisma.ChipTypeCreateManyInput | Prisma.ChipTypeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ChipType createManyAndReturn
 */
export type ChipTypeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * The data used to create many ChipTypes.
     */
    data: Prisma.ChipTypeCreateManyInput | Prisma.ChipTypeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ChipType update
 */
export type ChipTypeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * The data needed to update a ChipType.
     */
    data: Prisma.XOR<Prisma.ChipTypeUpdateInput, Prisma.ChipTypeUncheckedUpdateInput>;
    /**
     * Choose, which ChipType to update.
     */
    where: Prisma.ChipTypeWhereUniqueInput;
};
/**
 * ChipType updateMany
 */
export type ChipTypeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ChipTypes.
     */
    data: Prisma.XOR<Prisma.ChipTypeUpdateManyMutationInput, Prisma.ChipTypeUncheckedUpdateManyInput>;
    /**
     * Filter which ChipTypes to update
     */
    where?: Prisma.ChipTypeWhereInput;
    /**
     * Limit how many ChipTypes to update.
     */
    limit?: number;
};
/**
 * ChipType updateManyAndReturn
 */
export type ChipTypeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * The data used to update ChipTypes.
     */
    data: Prisma.XOR<Prisma.ChipTypeUpdateManyMutationInput, Prisma.ChipTypeUncheckedUpdateManyInput>;
    /**
     * Filter which ChipTypes to update
     */
    where?: Prisma.ChipTypeWhereInput;
    /**
     * Limit how many ChipTypes to update.
     */
    limit?: number;
};
/**
 * ChipType upsert
 */
export type ChipTypeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * The filter to search for the ChipType to update in case it exists.
     */
    where: Prisma.ChipTypeWhereUniqueInput;
    /**
     * In case the ChipType found by the `where` argument doesn't exist, create a new ChipType with this data.
     */
    create: Prisma.XOR<Prisma.ChipTypeCreateInput, Prisma.ChipTypeUncheckedCreateInput>;
    /**
     * In case the ChipType was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ChipTypeUpdateInput, Prisma.ChipTypeUncheckedUpdateInput>;
};
/**
 * ChipType delete
 */
export type ChipTypeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
    /**
     * Filter which ChipType to delete.
     */
    where: Prisma.ChipTypeWhereUniqueInput;
};
/**
 * ChipType deleteMany
 */
export type ChipTypeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ChipTypes to delete
     */
    where?: Prisma.ChipTypeWhereInput;
    /**
     * Limit how many ChipTypes to delete.
     */
    limit?: number;
};
/**
 * ChipType.chipPlays
 */
export type ChipType$chipPlaysArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipPlay
     */
    select?: Prisma.ChipPlaySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipPlay
     */
    omit?: Prisma.ChipPlayOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipPlayInclude<ExtArgs> | null;
    where?: Prisma.ChipPlayWhereInput;
    orderBy?: Prisma.ChipPlayOrderByWithRelationInput | Prisma.ChipPlayOrderByWithRelationInput[];
    cursor?: Prisma.ChipPlayWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChipPlayScalarFieldEnum | Prisma.ChipPlayScalarFieldEnum[];
};
/**
 * ChipType without action
 */
export type ChipTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipType
     */
    select?: Prisma.ChipTypeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipType
     */
    omit?: Prisma.ChipTypeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipTypeInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=ChipType.d.ts.map