import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ChipPlay
 *
 */
export type ChipPlayModel = runtime.Types.Result.DefaultSelection<Prisma.$ChipPlayPayload>;
export type AggregateChipPlay = {
    _count: ChipPlayCountAggregateOutputType | null;
    _avg: ChipPlayAvgAggregateOutputType | null;
    _sum: ChipPlaySumAggregateOutputType | null;
    _min: ChipPlayMinAggregateOutputType | null;
    _max: ChipPlayMaxAggregateOutputType | null;
};
export type ChipPlayAvgAggregateOutputType = {
    chipTypeId: number | null;
};
export type ChipPlaySumAggregateOutputType = {
    chipTypeId: number | null;
};
export type ChipPlayMinAggregateOutputType = {
    id: string | null;
    seasonUserId: string | null;
    chipTypeId: number | null;
    startMatchId: string | null;
    status: $Enums.ChipPlayStatus | null;
    canceledAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChipPlayMaxAggregateOutputType = {
    id: string | null;
    seasonUserId: string | null;
    chipTypeId: number | null;
    startMatchId: string | null;
    status: $Enums.ChipPlayStatus | null;
    canceledAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChipPlayCountAggregateOutputType = {
    id: number;
    seasonUserId: number;
    chipTypeId: number;
    startMatchId: number;
    status: number;
    canceledAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ChipPlayAvgAggregateInputType = {
    chipTypeId?: true;
};
export type ChipPlaySumAggregateInputType = {
    chipTypeId?: true;
};
export type ChipPlayMinAggregateInputType = {
    id?: true;
    seasonUserId?: true;
    chipTypeId?: true;
    startMatchId?: true;
    status?: true;
    canceledAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChipPlayMaxAggregateInputType = {
    id?: true;
    seasonUserId?: true;
    chipTypeId?: true;
    startMatchId?: true;
    status?: true;
    canceledAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChipPlayCountAggregateInputType = {
    id?: true;
    seasonUserId?: true;
    chipTypeId?: true;
    startMatchId?: true;
    status?: true;
    canceledAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ChipPlayAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ChipPlay to aggregate.
     */
    where?: Prisma.ChipPlayWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipPlays to fetch.
     */
    orderBy?: Prisma.ChipPlayOrderByWithRelationInput | Prisma.ChipPlayOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ChipPlayWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipPlays from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipPlays.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ChipPlays
    **/
    _count?: true | ChipPlayCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: ChipPlayAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: ChipPlaySumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ChipPlayMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ChipPlayMaxAggregateInputType;
};
export type GetChipPlayAggregateType<T extends ChipPlayAggregateArgs> = {
    [P in keyof T & keyof AggregateChipPlay]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateChipPlay[P]> : Prisma.GetScalarType<T[P], AggregateChipPlay[P]>;
};
export type ChipPlayGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChipPlayWhereInput;
    orderBy?: Prisma.ChipPlayOrderByWithAggregationInput | Prisma.ChipPlayOrderByWithAggregationInput[];
    by: Prisma.ChipPlayScalarFieldEnum[] | Prisma.ChipPlayScalarFieldEnum;
    having?: Prisma.ChipPlayScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ChipPlayCountAggregateInputType | true;
    _avg?: ChipPlayAvgAggregateInputType;
    _sum?: ChipPlaySumAggregateInputType;
    _min?: ChipPlayMinAggregateInputType;
    _max?: ChipPlayMaxAggregateInputType;
};
export type ChipPlayGroupByOutputType = {
    id: string;
    seasonUserId: string;
    chipTypeId: number;
    startMatchId: string;
    status: $Enums.ChipPlayStatus;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ChipPlayCountAggregateOutputType | null;
    _avg: ChipPlayAvgAggregateOutputType | null;
    _sum: ChipPlaySumAggregateOutputType | null;
    _min: ChipPlayMinAggregateOutputType | null;
    _max: ChipPlayMaxAggregateOutputType | null;
};
type GetChipPlayGroupByPayload<T extends ChipPlayGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ChipPlayGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ChipPlayGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ChipPlayGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ChipPlayGroupByOutputType[P]>;
}>>;
export type ChipPlayWhereInput = {
    AND?: Prisma.ChipPlayWhereInput | Prisma.ChipPlayWhereInput[];
    OR?: Prisma.ChipPlayWhereInput[];
    NOT?: Prisma.ChipPlayWhereInput | Prisma.ChipPlayWhereInput[];
    id?: Prisma.StringFilter<"ChipPlay"> | string;
    seasonUserId?: Prisma.StringFilter<"ChipPlay"> | string;
    chipTypeId?: Prisma.IntFilter<"ChipPlay"> | number;
    startMatchId?: Prisma.StringFilter<"ChipPlay"> | string;
    status?: Prisma.EnumChipPlayStatusFilter<"ChipPlay"> | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.DateTimeNullableFilter<"ChipPlay"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ChipPlay"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChipPlay"> | Date | string;
    seasonUser?: Prisma.XOR<Prisma.SeasonUserScalarRelationFilter, Prisma.SeasonUserWhereInput>;
    chipType?: Prisma.XOR<Prisma.ChipTypeScalarRelationFilter, Prisma.ChipTypeWhereInput>;
    startMatch?: Prisma.XOR<Prisma.MatchScalarRelationFilter, Prisma.MatchWhereInput>;
    scores?: Prisma.ScoreListRelationFilter;
};
export type ChipPlayOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    chipTypeId?: Prisma.SortOrder;
    startMatchId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    canceledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    seasonUser?: Prisma.SeasonUserOrderByWithRelationInput;
    chipType?: Prisma.ChipTypeOrderByWithRelationInput;
    startMatch?: Prisma.MatchOrderByWithRelationInput;
    scores?: Prisma.ScoreOrderByRelationAggregateInput;
};
export type ChipPlayWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    seasonUserId_chipTypeId_startMatchId?: Prisma.ChipPlaySeasonUserIdChipTypeIdStartMatchIdCompoundUniqueInput;
    AND?: Prisma.ChipPlayWhereInput | Prisma.ChipPlayWhereInput[];
    OR?: Prisma.ChipPlayWhereInput[];
    NOT?: Prisma.ChipPlayWhereInput | Prisma.ChipPlayWhereInput[];
    seasonUserId?: Prisma.StringFilter<"ChipPlay"> | string;
    chipTypeId?: Prisma.IntFilter<"ChipPlay"> | number;
    startMatchId?: Prisma.StringFilter<"ChipPlay"> | string;
    status?: Prisma.EnumChipPlayStatusFilter<"ChipPlay"> | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.DateTimeNullableFilter<"ChipPlay"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ChipPlay"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChipPlay"> | Date | string;
    seasonUser?: Prisma.XOR<Prisma.SeasonUserScalarRelationFilter, Prisma.SeasonUserWhereInput>;
    chipType?: Prisma.XOR<Prisma.ChipTypeScalarRelationFilter, Prisma.ChipTypeWhereInput>;
    startMatch?: Prisma.XOR<Prisma.MatchScalarRelationFilter, Prisma.MatchWhereInput>;
    scores?: Prisma.ScoreListRelationFilter;
}, "id" | "seasonUserId_chipTypeId_startMatchId">;
export type ChipPlayOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    chipTypeId?: Prisma.SortOrder;
    startMatchId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    canceledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ChipPlayCountOrderByAggregateInput;
    _avg?: Prisma.ChipPlayAvgOrderByAggregateInput;
    _max?: Prisma.ChipPlayMaxOrderByAggregateInput;
    _min?: Prisma.ChipPlayMinOrderByAggregateInput;
    _sum?: Prisma.ChipPlaySumOrderByAggregateInput;
};
export type ChipPlayScalarWhereWithAggregatesInput = {
    AND?: Prisma.ChipPlayScalarWhereWithAggregatesInput | Prisma.ChipPlayScalarWhereWithAggregatesInput[];
    OR?: Prisma.ChipPlayScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ChipPlayScalarWhereWithAggregatesInput | Prisma.ChipPlayScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ChipPlay"> | string;
    seasonUserId?: Prisma.StringWithAggregatesFilter<"ChipPlay"> | string;
    chipTypeId?: Prisma.IntWithAggregatesFilter<"ChipPlay"> | number;
    startMatchId?: Prisma.StringWithAggregatesFilter<"ChipPlay"> | string;
    status?: Prisma.EnumChipPlayStatusWithAggregatesFilter<"ChipPlay"> | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.DateTimeNullableWithAggregatesFilter<"ChipPlay"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ChipPlay"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ChipPlay"> | Date | string;
};
export type ChipPlayCreateInput = {
    id?: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    seasonUser: Prisma.SeasonUserCreateNestedOneWithoutChipPlaysInput;
    chipType: Prisma.ChipTypeCreateNestedOneWithoutChipPlaysInput;
    startMatch: Prisma.MatchCreateNestedOneWithoutChipPlaysInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayUncheckedCreateInput = {
    id?: string;
    seasonUserId: string;
    chipTypeId: number;
    startMatchId: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    seasonUser?: Prisma.SeasonUserUpdateOneRequiredWithoutChipPlaysNestedInput;
    chipType?: Prisma.ChipTypeUpdateOneRequiredWithoutChipPlaysNestedInput;
    startMatch?: Prisma.MatchUpdateOneRequiredWithoutChipPlaysNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    chipTypeId?: Prisma.IntFieldUpdateOperationsInput | number;
    startMatchId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayCreateManyInput = {
    id?: string;
    seasonUserId: string;
    chipTypeId: number;
    startMatchId: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipPlayUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipPlayUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    chipTypeId?: Prisma.IntFieldUpdateOperationsInput | number;
    startMatchId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipPlayListRelationFilter = {
    every?: Prisma.ChipPlayWhereInput;
    some?: Prisma.ChipPlayWhereInput;
    none?: Prisma.ChipPlayWhereInput;
};
export type ChipPlayOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ChipPlaySeasonUserIdChipTypeIdStartMatchIdCompoundUniqueInput = {
    seasonUserId: string;
    chipTypeId: number;
    startMatchId: string;
};
export type ChipPlayCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    chipTypeId?: Prisma.SortOrder;
    startMatchId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    canceledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChipPlayAvgOrderByAggregateInput = {
    chipTypeId?: Prisma.SortOrder;
};
export type ChipPlayMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    chipTypeId?: Prisma.SortOrder;
    startMatchId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    canceledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChipPlayMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    chipTypeId?: Prisma.SortOrder;
    startMatchId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    canceledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChipPlaySumOrderByAggregateInput = {
    chipTypeId?: Prisma.SortOrder;
};
export type ChipPlayNullableScalarRelationFilter = {
    is?: Prisma.ChipPlayWhereInput | null;
    isNot?: Prisma.ChipPlayWhereInput | null;
};
export type ChipPlayCreateNestedManyWithoutSeasonUserInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput> | Prisma.ChipPlayCreateWithoutSeasonUserInput[] | Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput | Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput[];
    createMany?: Prisma.ChipPlayCreateManySeasonUserInputEnvelope;
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
};
export type ChipPlayUncheckedCreateNestedManyWithoutSeasonUserInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput> | Prisma.ChipPlayCreateWithoutSeasonUserInput[] | Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput | Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput[];
    createMany?: Prisma.ChipPlayCreateManySeasonUserInputEnvelope;
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
};
export type ChipPlayUpdateManyWithoutSeasonUserNestedInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput> | Prisma.ChipPlayCreateWithoutSeasonUserInput[] | Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput | Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput[];
    upsert?: Prisma.ChipPlayUpsertWithWhereUniqueWithoutSeasonUserInput | Prisma.ChipPlayUpsertWithWhereUniqueWithoutSeasonUserInput[];
    createMany?: Prisma.ChipPlayCreateManySeasonUserInputEnvelope;
    set?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    disconnect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    delete?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    update?: Prisma.ChipPlayUpdateWithWhereUniqueWithoutSeasonUserInput | Prisma.ChipPlayUpdateWithWhereUniqueWithoutSeasonUserInput[];
    updateMany?: Prisma.ChipPlayUpdateManyWithWhereWithoutSeasonUserInput | Prisma.ChipPlayUpdateManyWithWhereWithoutSeasonUserInput[];
    deleteMany?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
};
export type ChipPlayUncheckedUpdateManyWithoutSeasonUserNestedInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput> | Prisma.ChipPlayCreateWithoutSeasonUserInput[] | Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput | Prisma.ChipPlayCreateOrConnectWithoutSeasonUserInput[];
    upsert?: Prisma.ChipPlayUpsertWithWhereUniqueWithoutSeasonUserInput | Prisma.ChipPlayUpsertWithWhereUniqueWithoutSeasonUserInput[];
    createMany?: Prisma.ChipPlayCreateManySeasonUserInputEnvelope;
    set?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    disconnect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    delete?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    update?: Prisma.ChipPlayUpdateWithWhereUniqueWithoutSeasonUserInput | Prisma.ChipPlayUpdateWithWhereUniqueWithoutSeasonUserInput[];
    updateMany?: Prisma.ChipPlayUpdateManyWithWhereWithoutSeasonUserInput | Prisma.ChipPlayUpdateManyWithWhereWithoutSeasonUserInput[];
    deleteMany?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
};
export type ChipPlayCreateNestedManyWithoutStartMatchInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutStartMatchInput, Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput> | Prisma.ChipPlayCreateWithoutStartMatchInput[] | Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput | Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput[];
    createMany?: Prisma.ChipPlayCreateManyStartMatchInputEnvelope;
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
};
export type ChipPlayUncheckedCreateNestedManyWithoutStartMatchInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutStartMatchInput, Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput> | Prisma.ChipPlayCreateWithoutStartMatchInput[] | Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput | Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput[];
    createMany?: Prisma.ChipPlayCreateManyStartMatchInputEnvelope;
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
};
export type ChipPlayUpdateManyWithoutStartMatchNestedInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutStartMatchInput, Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput> | Prisma.ChipPlayCreateWithoutStartMatchInput[] | Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput | Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput[];
    upsert?: Prisma.ChipPlayUpsertWithWhereUniqueWithoutStartMatchInput | Prisma.ChipPlayUpsertWithWhereUniqueWithoutStartMatchInput[];
    createMany?: Prisma.ChipPlayCreateManyStartMatchInputEnvelope;
    set?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    disconnect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    delete?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    update?: Prisma.ChipPlayUpdateWithWhereUniqueWithoutStartMatchInput | Prisma.ChipPlayUpdateWithWhereUniqueWithoutStartMatchInput[];
    updateMany?: Prisma.ChipPlayUpdateManyWithWhereWithoutStartMatchInput | Prisma.ChipPlayUpdateManyWithWhereWithoutStartMatchInput[];
    deleteMany?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
};
export type ChipPlayUncheckedUpdateManyWithoutStartMatchNestedInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutStartMatchInput, Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput> | Prisma.ChipPlayCreateWithoutStartMatchInput[] | Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput | Prisma.ChipPlayCreateOrConnectWithoutStartMatchInput[];
    upsert?: Prisma.ChipPlayUpsertWithWhereUniqueWithoutStartMatchInput | Prisma.ChipPlayUpsertWithWhereUniqueWithoutStartMatchInput[];
    createMany?: Prisma.ChipPlayCreateManyStartMatchInputEnvelope;
    set?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    disconnect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    delete?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    update?: Prisma.ChipPlayUpdateWithWhereUniqueWithoutStartMatchInput | Prisma.ChipPlayUpdateWithWhereUniqueWithoutStartMatchInput[];
    updateMany?: Prisma.ChipPlayUpdateManyWithWhereWithoutStartMatchInput | Prisma.ChipPlayUpdateManyWithWhereWithoutStartMatchInput[];
    deleteMany?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
};
export type ChipPlayCreateNestedManyWithoutChipTypeInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutChipTypeInput, Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput> | Prisma.ChipPlayCreateWithoutChipTypeInput[] | Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput | Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput[];
    createMany?: Prisma.ChipPlayCreateManyChipTypeInputEnvelope;
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
};
export type ChipPlayUncheckedCreateNestedManyWithoutChipTypeInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutChipTypeInput, Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput> | Prisma.ChipPlayCreateWithoutChipTypeInput[] | Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput | Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput[];
    createMany?: Prisma.ChipPlayCreateManyChipTypeInputEnvelope;
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
};
export type ChipPlayUpdateManyWithoutChipTypeNestedInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutChipTypeInput, Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput> | Prisma.ChipPlayCreateWithoutChipTypeInput[] | Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput | Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput[];
    upsert?: Prisma.ChipPlayUpsertWithWhereUniqueWithoutChipTypeInput | Prisma.ChipPlayUpsertWithWhereUniqueWithoutChipTypeInput[];
    createMany?: Prisma.ChipPlayCreateManyChipTypeInputEnvelope;
    set?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    disconnect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    delete?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    update?: Prisma.ChipPlayUpdateWithWhereUniqueWithoutChipTypeInput | Prisma.ChipPlayUpdateWithWhereUniqueWithoutChipTypeInput[];
    updateMany?: Prisma.ChipPlayUpdateManyWithWhereWithoutChipTypeInput | Prisma.ChipPlayUpdateManyWithWhereWithoutChipTypeInput[];
    deleteMany?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
};
export type ChipPlayUncheckedUpdateManyWithoutChipTypeNestedInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutChipTypeInput, Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput> | Prisma.ChipPlayCreateWithoutChipTypeInput[] | Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput[];
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput | Prisma.ChipPlayCreateOrConnectWithoutChipTypeInput[];
    upsert?: Prisma.ChipPlayUpsertWithWhereUniqueWithoutChipTypeInput | Prisma.ChipPlayUpsertWithWhereUniqueWithoutChipTypeInput[];
    createMany?: Prisma.ChipPlayCreateManyChipTypeInputEnvelope;
    set?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    disconnect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    delete?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    connect?: Prisma.ChipPlayWhereUniqueInput | Prisma.ChipPlayWhereUniqueInput[];
    update?: Prisma.ChipPlayUpdateWithWhereUniqueWithoutChipTypeInput | Prisma.ChipPlayUpdateWithWhereUniqueWithoutChipTypeInput[];
    updateMany?: Prisma.ChipPlayUpdateManyWithWhereWithoutChipTypeInput | Prisma.ChipPlayUpdateManyWithWhereWithoutChipTypeInput[];
    deleteMany?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
};
export type EnumChipPlayStatusFieldUpdateOperationsInput = {
    set?: $Enums.ChipPlayStatus;
};
export type ChipPlayCreateNestedOneWithoutScoresInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutScoresInput, Prisma.ChipPlayUncheckedCreateWithoutScoresInput>;
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutScoresInput;
    connect?: Prisma.ChipPlayWhereUniqueInput;
};
export type ChipPlayUpdateOneWithoutScoresNestedInput = {
    create?: Prisma.XOR<Prisma.ChipPlayCreateWithoutScoresInput, Prisma.ChipPlayUncheckedCreateWithoutScoresInput>;
    connectOrCreate?: Prisma.ChipPlayCreateOrConnectWithoutScoresInput;
    upsert?: Prisma.ChipPlayUpsertWithoutScoresInput;
    disconnect?: Prisma.ChipPlayWhereInput | boolean;
    delete?: Prisma.ChipPlayWhereInput | boolean;
    connect?: Prisma.ChipPlayWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ChipPlayUpdateToOneWithWhereWithoutScoresInput, Prisma.ChipPlayUpdateWithoutScoresInput>, Prisma.ChipPlayUncheckedUpdateWithoutScoresInput>;
};
export type ChipPlayCreateWithoutSeasonUserInput = {
    id?: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    chipType: Prisma.ChipTypeCreateNestedOneWithoutChipPlaysInput;
    startMatch: Prisma.MatchCreateNestedOneWithoutChipPlaysInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayUncheckedCreateWithoutSeasonUserInput = {
    id?: string;
    chipTypeId: number;
    startMatchId: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayCreateOrConnectWithoutSeasonUserInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput>;
};
export type ChipPlayCreateManySeasonUserInputEnvelope = {
    data: Prisma.ChipPlayCreateManySeasonUserInput | Prisma.ChipPlayCreateManySeasonUserInput[];
    skipDuplicates?: boolean;
};
export type ChipPlayUpsertWithWhereUniqueWithoutSeasonUserInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    update: Prisma.XOR<Prisma.ChipPlayUpdateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedUpdateWithoutSeasonUserInput>;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedCreateWithoutSeasonUserInput>;
};
export type ChipPlayUpdateWithWhereUniqueWithoutSeasonUserInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    data: Prisma.XOR<Prisma.ChipPlayUpdateWithoutSeasonUserInput, Prisma.ChipPlayUncheckedUpdateWithoutSeasonUserInput>;
};
export type ChipPlayUpdateManyWithWhereWithoutSeasonUserInput = {
    where: Prisma.ChipPlayScalarWhereInput;
    data: Prisma.XOR<Prisma.ChipPlayUpdateManyMutationInput, Prisma.ChipPlayUncheckedUpdateManyWithoutSeasonUserInput>;
};
export type ChipPlayScalarWhereInput = {
    AND?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
    OR?: Prisma.ChipPlayScalarWhereInput[];
    NOT?: Prisma.ChipPlayScalarWhereInput | Prisma.ChipPlayScalarWhereInput[];
    id?: Prisma.StringFilter<"ChipPlay"> | string;
    seasonUserId?: Prisma.StringFilter<"ChipPlay"> | string;
    chipTypeId?: Prisma.IntFilter<"ChipPlay"> | number;
    startMatchId?: Prisma.StringFilter<"ChipPlay"> | string;
    status?: Prisma.EnumChipPlayStatusFilter<"ChipPlay"> | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.DateTimeNullableFilter<"ChipPlay"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ChipPlay"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChipPlay"> | Date | string;
};
export type ChipPlayCreateWithoutStartMatchInput = {
    id?: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    seasonUser: Prisma.SeasonUserCreateNestedOneWithoutChipPlaysInput;
    chipType: Prisma.ChipTypeCreateNestedOneWithoutChipPlaysInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayUncheckedCreateWithoutStartMatchInput = {
    id?: string;
    seasonUserId: string;
    chipTypeId: number;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayCreateOrConnectWithoutStartMatchInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutStartMatchInput, Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput>;
};
export type ChipPlayCreateManyStartMatchInputEnvelope = {
    data: Prisma.ChipPlayCreateManyStartMatchInput | Prisma.ChipPlayCreateManyStartMatchInput[];
    skipDuplicates?: boolean;
};
export type ChipPlayUpsertWithWhereUniqueWithoutStartMatchInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    update: Prisma.XOR<Prisma.ChipPlayUpdateWithoutStartMatchInput, Prisma.ChipPlayUncheckedUpdateWithoutStartMatchInput>;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutStartMatchInput, Prisma.ChipPlayUncheckedCreateWithoutStartMatchInput>;
};
export type ChipPlayUpdateWithWhereUniqueWithoutStartMatchInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    data: Prisma.XOR<Prisma.ChipPlayUpdateWithoutStartMatchInput, Prisma.ChipPlayUncheckedUpdateWithoutStartMatchInput>;
};
export type ChipPlayUpdateManyWithWhereWithoutStartMatchInput = {
    where: Prisma.ChipPlayScalarWhereInput;
    data: Prisma.XOR<Prisma.ChipPlayUpdateManyMutationInput, Prisma.ChipPlayUncheckedUpdateManyWithoutStartMatchInput>;
};
export type ChipPlayCreateWithoutChipTypeInput = {
    id?: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    seasonUser: Prisma.SeasonUserCreateNestedOneWithoutChipPlaysInput;
    startMatch: Prisma.MatchCreateNestedOneWithoutChipPlaysInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayUncheckedCreateWithoutChipTypeInput = {
    id?: string;
    seasonUserId: string;
    startMatchId: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutChipPlayInput;
};
export type ChipPlayCreateOrConnectWithoutChipTypeInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutChipTypeInput, Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput>;
};
export type ChipPlayCreateManyChipTypeInputEnvelope = {
    data: Prisma.ChipPlayCreateManyChipTypeInput | Prisma.ChipPlayCreateManyChipTypeInput[];
    skipDuplicates?: boolean;
};
export type ChipPlayUpsertWithWhereUniqueWithoutChipTypeInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    update: Prisma.XOR<Prisma.ChipPlayUpdateWithoutChipTypeInput, Prisma.ChipPlayUncheckedUpdateWithoutChipTypeInput>;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutChipTypeInput, Prisma.ChipPlayUncheckedCreateWithoutChipTypeInput>;
};
export type ChipPlayUpdateWithWhereUniqueWithoutChipTypeInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    data: Prisma.XOR<Prisma.ChipPlayUpdateWithoutChipTypeInput, Prisma.ChipPlayUncheckedUpdateWithoutChipTypeInput>;
};
export type ChipPlayUpdateManyWithWhereWithoutChipTypeInput = {
    where: Prisma.ChipPlayScalarWhereInput;
    data: Prisma.XOR<Prisma.ChipPlayUpdateManyMutationInput, Prisma.ChipPlayUncheckedUpdateManyWithoutChipTypeInput>;
};
export type ChipPlayCreateWithoutScoresInput = {
    id?: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    seasonUser: Prisma.SeasonUserCreateNestedOneWithoutChipPlaysInput;
    chipType: Prisma.ChipTypeCreateNestedOneWithoutChipPlaysInput;
    startMatch: Prisma.MatchCreateNestedOneWithoutChipPlaysInput;
};
export type ChipPlayUncheckedCreateWithoutScoresInput = {
    id?: string;
    seasonUserId: string;
    chipTypeId: number;
    startMatchId: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipPlayCreateOrConnectWithoutScoresInput = {
    where: Prisma.ChipPlayWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutScoresInput, Prisma.ChipPlayUncheckedCreateWithoutScoresInput>;
};
export type ChipPlayUpsertWithoutScoresInput = {
    update: Prisma.XOR<Prisma.ChipPlayUpdateWithoutScoresInput, Prisma.ChipPlayUncheckedUpdateWithoutScoresInput>;
    create: Prisma.XOR<Prisma.ChipPlayCreateWithoutScoresInput, Prisma.ChipPlayUncheckedCreateWithoutScoresInput>;
    where?: Prisma.ChipPlayWhereInput;
};
export type ChipPlayUpdateToOneWithWhereWithoutScoresInput = {
    where?: Prisma.ChipPlayWhereInput;
    data: Prisma.XOR<Prisma.ChipPlayUpdateWithoutScoresInput, Prisma.ChipPlayUncheckedUpdateWithoutScoresInput>;
};
export type ChipPlayUpdateWithoutScoresInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    seasonUser?: Prisma.SeasonUserUpdateOneRequiredWithoutChipPlaysNestedInput;
    chipType?: Prisma.ChipTypeUpdateOneRequiredWithoutChipPlaysNestedInput;
    startMatch?: Prisma.MatchUpdateOneRequiredWithoutChipPlaysNestedInput;
};
export type ChipPlayUncheckedUpdateWithoutScoresInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    chipTypeId?: Prisma.IntFieldUpdateOperationsInput | number;
    startMatchId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipPlayCreateManySeasonUserInput = {
    id?: string;
    chipTypeId: number;
    startMatchId: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipPlayUpdateWithoutSeasonUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    chipType?: Prisma.ChipTypeUpdateOneRequiredWithoutChipPlaysNestedInput;
    startMatch?: Prisma.MatchUpdateOneRequiredWithoutChipPlaysNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayUncheckedUpdateWithoutSeasonUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chipTypeId?: Prisma.IntFieldUpdateOperationsInput | number;
    startMatchId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayUncheckedUpdateManyWithoutSeasonUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chipTypeId?: Prisma.IntFieldUpdateOperationsInput | number;
    startMatchId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipPlayCreateManyStartMatchInput = {
    id?: string;
    seasonUserId: string;
    chipTypeId: number;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipPlayUpdateWithoutStartMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    seasonUser?: Prisma.SeasonUserUpdateOneRequiredWithoutChipPlaysNestedInput;
    chipType?: Prisma.ChipTypeUpdateOneRequiredWithoutChipPlaysNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayUncheckedUpdateWithoutStartMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    chipTypeId?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayUncheckedUpdateManyWithoutStartMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    chipTypeId?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChipPlayCreateManyChipTypeInput = {
    id?: string;
    seasonUserId: string;
    startMatchId: string;
    status?: $Enums.ChipPlayStatus;
    canceledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChipPlayUpdateWithoutChipTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    seasonUser?: Prisma.SeasonUserUpdateOneRequiredWithoutChipPlaysNestedInput;
    startMatch?: Prisma.MatchUpdateOneRequiredWithoutChipPlaysNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayUncheckedUpdateWithoutChipTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    startMatchId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutChipPlayNestedInput;
};
export type ChipPlayUncheckedUpdateManyWithoutChipTypeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    startMatchId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumChipPlayStatusFieldUpdateOperationsInput | $Enums.ChipPlayStatus;
    canceledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type ChipPlayCountOutputType
 */
export type ChipPlayCountOutputType = {
    scores: number;
};
export type ChipPlayCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    scores?: boolean | ChipPlayCountOutputTypeCountScoresArgs;
};
/**
 * ChipPlayCountOutputType without action
 */
export type ChipPlayCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipPlayCountOutputType
     */
    select?: Prisma.ChipPlayCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ChipPlayCountOutputType without action
 */
export type ChipPlayCountOutputTypeCountScoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScoreWhereInput;
};
export type ChipPlaySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonUserId?: boolean;
    chipTypeId?: boolean;
    startMatchId?: boolean;
    status?: boolean;
    canceledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    chipType?: boolean | Prisma.ChipTypeDefaultArgs<ExtArgs>;
    startMatch?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
    scores?: boolean | Prisma.ChipPlay$scoresArgs<ExtArgs>;
    _count?: boolean | Prisma.ChipPlayCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chipPlay"]>;
export type ChipPlaySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonUserId?: boolean;
    chipTypeId?: boolean;
    startMatchId?: boolean;
    status?: boolean;
    canceledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    chipType?: boolean | Prisma.ChipTypeDefaultArgs<ExtArgs>;
    startMatch?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chipPlay"]>;
export type ChipPlaySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonUserId?: boolean;
    chipTypeId?: boolean;
    startMatchId?: boolean;
    status?: boolean;
    canceledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    chipType?: boolean | Prisma.ChipTypeDefaultArgs<ExtArgs>;
    startMatch?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chipPlay"]>;
export type ChipPlaySelectScalar = {
    id?: boolean;
    seasonUserId?: boolean;
    chipTypeId?: boolean;
    startMatchId?: boolean;
    status?: boolean;
    canceledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ChipPlayOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "seasonUserId" | "chipTypeId" | "startMatchId" | "status" | "canceledAt" | "createdAt" | "updatedAt", ExtArgs["result"]["chipPlay"]>;
export type ChipPlayInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    chipType?: boolean | Prisma.ChipTypeDefaultArgs<ExtArgs>;
    startMatch?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
    scores?: boolean | Prisma.ChipPlay$scoresArgs<ExtArgs>;
    _count?: boolean | Prisma.ChipPlayCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ChipPlayIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    chipType?: boolean | Prisma.ChipTypeDefaultArgs<ExtArgs>;
    startMatch?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
};
export type ChipPlayIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    chipType?: boolean | Prisma.ChipTypeDefaultArgs<ExtArgs>;
    startMatch?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
};
export type $ChipPlayPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ChipPlay";
    objects: {
        seasonUser: Prisma.$SeasonUserPayload<ExtArgs>;
        chipType: Prisma.$ChipTypePayload<ExtArgs>;
        startMatch: Prisma.$MatchPayload<ExtArgs>;
        scores: Prisma.$ScorePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        seasonUserId: string;
        chipTypeId: number;
        startMatchId: string;
        status: $Enums.ChipPlayStatus;
        canceledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["chipPlay"]>;
    composites: {};
};
export type ChipPlayGetPayload<S extends boolean | null | undefined | ChipPlayDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload, S>;
export type ChipPlayCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ChipPlayFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ChipPlayCountAggregateInputType | true;
};
export interface ChipPlayDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ChipPlay'];
        meta: {
            name: 'ChipPlay';
        };
    };
    /**
     * Find zero or one ChipPlay that matches the filter.
     * @param {ChipPlayFindUniqueArgs} args - Arguments to find a ChipPlay
     * @example
     * // Get one ChipPlay
     * const chipPlay = await prisma.chipPlay.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChipPlayFindUniqueArgs>(args: Prisma.SelectSubset<T, ChipPlayFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ChipPlay that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChipPlayFindUniqueOrThrowArgs} args - Arguments to find a ChipPlay
     * @example
     * // Get one ChipPlay
     * const chipPlay = await prisma.chipPlay.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChipPlayFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ChipPlayFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ChipPlay that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipPlayFindFirstArgs} args - Arguments to find a ChipPlay
     * @example
     * // Get one ChipPlay
     * const chipPlay = await prisma.chipPlay.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChipPlayFindFirstArgs>(args?: Prisma.SelectSubset<T, ChipPlayFindFirstArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ChipPlay that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipPlayFindFirstOrThrowArgs} args - Arguments to find a ChipPlay
     * @example
     * // Get one ChipPlay
     * const chipPlay = await prisma.chipPlay.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChipPlayFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ChipPlayFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ChipPlays that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipPlayFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChipPlays
     * const chipPlays = await prisma.chipPlay.findMany()
     *
     * // Get first 10 ChipPlays
     * const chipPlays = await prisma.chipPlay.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const chipPlayWithIdOnly = await prisma.chipPlay.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ChipPlayFindManyArgs>(args?: Prisma.SelectSubset<T, ChipPlayFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ChipPlay.
     * @param {ChipPlayCreateArgs} args - Arguments to create a ChipPlay.
     * @example
     * // Create one ChipPlay
     * const ChipPlay = await prisma.chipPlay.create({
     *   data: {
     *     // ... data to create a ChipPlay
     *   }
     * })
     *
     */
    create<T extends ChipPlayCreateArgs>(args: Prisma.SelectSubset<T, ChipPlayCreateArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ChipPlays.
     * @param {ChipPlayCreateManyArgs} args - Arguments to create many ChipPlays.
     * @example
     * // Create many ChipPlays
     * const chipPlay = await prisma.chipPlay.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ChipPlayCreateManyArgs>(args?: Prisma.SelectSubset<T, ChipPlayCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ChipPlays and returns the data saved in the database.
     * @param {ChipPlayCreateManyAndReturnArgs} args - Arguments to create many ChipPlays.
     * @example
     * // Create many ChipPlays
     * const chipPlay = await prisma.chipPlay.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ChipPlays and only return the `id`
     * const chipPlayWithIdOnly = await prisma.chipPlay.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ChipPlayCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ChipPlayCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ChipPlay.
     * @param {ChipPlayDeleteArgs} args - Arguments to delete one ChipPlay.
     * @example
     * // Delete one ChipPlay
     * const ChipPlay = await prisma.chipPlay.delete({
     *   where: {
     *     // ... filter to delete one ChipPlay
     *   }
     * })
     *
     */
    delete<T extends ChipPlayDeleteArgs>(args: Prisma.SelectSubset<T, ChipPlayDeleteArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ChipPlay.
     * @param {ChipPlayUpdateArgs} args - Arguments to update one ChipPlay.
     * @example
     * // Update one ChipPlay
     * const chipPlay = await prisma.chipPlay.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ChipPlayUpdateArgs>(args: Prisma.SelectSubset<T, ChipPlayUpdateArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ChipPlays.
     * @param {ChipPlayDeleteManyArgs} args - Arguments to filter ChipPlays to delete.
     * @example
     * // Delete a few ChipPlays
     * const { count } = await prisma.chipPlay.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ChipPlayDeleteManyArgs>(args?: Prisma.SelectSubset<T, ChipPlayDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ChipPlays.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipPlayUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChipPlays
     * const chipPlay = await prisma.chipPlay.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ChipPlayUpdateManyArgs>(args: Prisma.SelectSubset<T, ChipPlayUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ChipPlays and returns the data updated in the database.
     * @param {ChipPlayUpdateManyAndReturnArgs} args - Arguments to update many ChipPlays.
     * @example
     * // Update many ChipPlays
     * const chipPlay = await prisma.chipPlay.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ChipPlays and only return the `id`
     * const chipPlayWithIdOnly = await prisma.chipPlay.updateManyAndReturn({
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
    updateManyAndReturn<T extends ChipPlayUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ChipPlayUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ChipPlay.
     * @param {ChipPlayUpsertArgs} args - Arguments to update or create a ChipPlay.
     * @example
     * // Update or create a ChipPlay
     * const chipPlay = await prisma.chipPlay.upsert({
     *   create: {
     *     // ... data to create a ChipPlay
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChipPlay we want to update
     *   }
     * })
     */
    upsert<T extends ChipPlayUpsertArgs>(args: Prisma.SelectSubset<T, ChipPlayUpsertArgs<ExtArgs>>): Prisma.Prisma__ChipPlayClient<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ChipPlays.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipPlayCountArgs} args - Arguments to filter ChipPlays to count.
     * @example
     * // Count the number of ChipPlays
     * const count = await prisma.chipPlay.count({
     *   where: {
     *     // ... the filter for the ChipPlays we want to count
     *   }
     * })
    **/
    count<T extends ChipPlayCountArgs>(args?: Prisma.Subset<T, ChipPlayCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ChipPlayCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ChipPlay.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipPlayAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ChipPlayAggregateArgs>(args: Prisma.Subset<T, ChipPlayAggregateArgs>): Prisma.PrismaPromise<GetChipPlayAggregateType<T>>;
    /**
     * Group by ChipPlay.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChipPlayGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ChipPlayGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ChipPlayGroupByArgs['orderBy'];
    } : {
        orderBy?: ChipPlayGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ChipPlayGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChipPlayGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ChipPlay model
     */
    readonly fields: ChipPlayFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ChipPlay.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ChipPlayClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    seasonUser<T extends Prisma.SeasonUserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SeasonUserDefaultArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    chipType<T extends Prisma.ChipTypeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ChipTypeDefaultArgs<ExtArgs>>): Prisma.Prisma__ChipTypeClient<runtime.Types.Result.GetResult<Prisma.$ChipTypePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    startMatch<T extends Prisma.MatchDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MatchDefaultArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    scores<T extends Prisma.ChipPlay$scoresArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ChipPlay$scoresArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the ChipPlay model
 */
export interface ChipPlayFieldRefs {
    readonly id: Prisma.FieldRef<"ChipPlay", 'String'>;
    readonly seasonUserId: Prisma.FieldRef<"ChipPlay", 'String'>;
    readonly chipTypeId: Prisma.FieldRef<"ChipPlay", 'Int'>;
    readonly startMatchId: Prisma.FieldRef<"ChipPlay", 'String'>;
    readonly status: Prisma.FieldRef<"ChipPlay", 'ChipPlayStatus'>;
    readonly canceledAt: Prisma.FieldRef<"ChipPlay", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"ChipPlay", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ChipPlay", 'DateTime'>;
}
/**
 * ChipPlay findUnique
 */
export type ChipPlayFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ChipPlay to fetch.
     */
    where: Prisma.ChipPlayWhereUniqueInput;
};
/**
 * ChipPlay findUniqueOrThrow
 */
export type ChipPlayFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ChipPlay to fetch.
     */
    where: Prisma.ChipPlayWhereUniqueInput;
};
/**
 * ChipPlay findFirst
 */
export type ChipPlayFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ChipPlay to fetch.
     */
    where?: Prisma.ChipPlayWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipPlays to fetch.
     */
    orderBy?: Prisma.ChipPlayOrderByWithRelationInput | Prisma.ChipPlayOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ChipPlays.
     */
    cursor?: Prisma.ChipPlayWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipPlays from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipPlays.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ChipPlays.
     */
    distinct?: Prisma.ChipPlayScalarFieldEnum | Prisma.ChipPlayScalarFieldEnum[];
};
/**
 * ChipPlay findFirstOrThrow
 */
export type ChipPlayFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ChipPlay to fetch.
     */
    where?: Prisma.ChipPlayWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipPlays to fetch.
     */
    orderBy?: Prisma.ChipPlayOrderByWithRelationInput | Prisma.ChipPlayOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ChipPlays.
     */
    cursor?: Prisma.ChipPlayWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipPlays from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipPlays.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ChipPlays.
     */
    distinct?: Prisma.ChipPlayScalarFieldEnum | Prisma.ChipPlayScalarFieldEnum[];
};
/**
 * ChipPlay findMany
 */
export type ChipPlayFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which ChipPlays to fetch.
     */
    where?: Prisma.ChipPlayWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ChipPlays to fetch.
     */
    orderBy?: Prisma.ChipPlayOrderByWithRelationInput | Prisma.ChipPlayOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ChipPlays.
     */
    cursor?: Prisma.ChipPlayWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ChipPlays from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ChipPlays.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ChipPlays.
     */
    distinct?: Prisma.ChipPlayScalarFieldEnum | Prisma.ChipPlayScalarFieldEnum[];
};
/**
 * ChipPlay create
 */
export type ChipPlayCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a ChipPlay.
     */
    data: Prisma.XOR<Prisma.ChipPlayCreateInput, Prisma.ChipPlayUncheckedCreateInput>;
};
/**
 * ChipPlay createMany
 */
export type ChipPlayCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChipPlays.
     */
    data: Prisma.ChipPlayCreateManyInput | Prisma.ChipPlayCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ChipPlay createManyAndReturn
 */
export type ChipPlayCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipPlay
     */
    select?: Prisma.ChipPlaySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipPlay
     */
    omit?: Prisma.ChipPlayOmit<ExtArgs> | null;
    /**
     * The data used to create many ChipPlays.
     */
    data: Prisma.ChipPlayCreateManyInput | Prisma.ChipPlayCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipPlayIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ChipPlay update
 */
export type ChipPlayUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a ChipPlay.
     */
    data: Prisma.XOR<Prisma.ChipPlayUpdateInput, Prisma.ChipPlayUncheckedUpdateInput>;
    /**
     * Choose, which ChipPlay to update.
     */
    where: Prisma.ChipPlayWhereUniqueInput;
};
/**
 * ChipPlay updateMany
 */
export type ChipPlayUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ChipPlays.
     */
    data: Prisma.XOR<Prisma.ChipPlayUpdateManyMutationInput, Prisma.ChipPlayUncheckedUpdateManyInput>;
    /**
     * Filter which ChipPlays to update
     */
    where?: Prisma.ChipPlayWhereInput;
    /**
     * Limit how many ChipPlays to update.
     */
    limit?: number;
};
/**
 * ChipPlay updateManyAndReturn
 */
export type ChipPlayUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipPlay
     */
    select?: Prisma.ChipPlaySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipPlay
     */
    omit?: Prisma.ChipPlayOmit<ExtArgs> | null;
    /**
     * The data used to update ChipPlays.
     */
    data: Prisma.XOR<Prisma.ChipPlayUpdateManyMutationInput, Prisma.ChipPlayUncheckedUpdateManyInput>;
    /**
     * Filter which ChipPlays to update
     */
    where?: Prisma.ChipPlayWhereInput;
    /**
     * Limit how many ChipPlays to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipPlayIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ChipPlay upsert
 */
export type ChipPlayUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the ChipPlay to update in case it exists.
     */
    where: Prisma.ChipPlayWhereUniqueInput;
    /**
     * In case the ChipPlay found by the `where` argument doesn't exist, create a new ChipPlay with this data.
     */
    create: Prisma.XOR<Prisma.ChipPlayCreateInput, Prisma.ChipPlayUncheckedCreateInput>;
    /**
     * In case the ChipPlay was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ChipPlayUpdateInput, Prisma.ChipPlayUncheckedUpdateInput>;
};
/**
 * ChipPlay delete
 */
export type ChipPlayDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which ChipPlay to delete.
     */
    where: Prisma.ChipPlayWhereUniqueInput;
};
/**
 * ChipPlay deleteMany
 */
export type ChipPlayDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ChipPlays to delete
     */
    where?: Prisma.ChipPlayWhereInput;
    /**
     * Limit how many ChipPlays to delete.
     */
    limit?: number;
};
/**
 * ChipPlay.scores
 */
export type ChipPlay$scoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: Prisma.ScoreSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Score
     */
    omit?: Prisma.ScoreOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScoreInclude<ExtArgs> | null;
    where?: Prisma.ScoreWhereInput;
    orderBy?: Prisma.ScoreOrderByWithRelationInput | Prisma.ScoreOrderByWithRelationInput[];
    cursor?: Prisma.ScoreWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScoreScalarFieldEnum | Prisma.ScoreScalarFieldEnum[];
};
/**
 * ChipPlay without action
 */
export type ChipPlayDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=ChipPlay.d.ts.map