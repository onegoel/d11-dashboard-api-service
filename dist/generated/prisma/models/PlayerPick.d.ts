import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model PlayerPick
 *
 */
export type PlayerPickModel = runtime.Types.Result.DefaultSelection<Prisma.$PlayerPickPayload>;
export type AggregatePlayerPick = {
    _count: PlayerPickCountAggregateOutputType | null;
    _avg: PlayerPickAvgAggregateOutputType | null;
    _sum: PlayerPickSumAggregateOutputType | null;
    _min: PlayerPickMinAggregateOutputType | null;
    _max: PlayerPickMaxAggregateOutputType | null;
};
export type PlayerPickAvgAggregateOutputType = {
    points: number | null;
};
export type PlayerPickSumAggregateOutputType = {
    points: number | null;
};
export type PlayerPickMinAggregateOutputType = {
    id: string | null;
    seasonUserId: string | null;
    matchId: string | null;
    playerName: string | null;
    isCaptain: boolean | null;
    points: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PlayerPickMaxAggregateOutputType = {
    id: string | null;
    seasonUserId: string | null;
    matchId: string | null;
    playerName: string | null;
    isCaptain: boolean | null;
    points: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PlayerPickCountAggregateOutputType = {
    id: number;
    seasonUserId: number;
    matchId: number;
    playerName: number;
    isCaptain: number;
    points: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type PlayerPickAvgAggregateInputType = {
    points?: true;
};
export type PlayerPickSumAggregateInputType = {
    points?: true;
};
export type PlayerPickMinAggregateInputType = {
    id?: true;
    seasonUserId?: true;
    matchId?: true;
    playerName?: true;
    isCaptain?: true;
    points?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PlayerPickMaxAggregateInputType = {
    id?: true;
    seasonUserId?: true;
    matchId?: true;
    playerName?: true;
    isCaptain?: true;
    points?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PlayerPickCountAggregateInputType = {
    id?: true;
    seasonUserId?: true;
    matchId?: true;
    playerName?: true;
    isCaptain?: true;
    points?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type PlayerPickAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PlayerPick to aggregate.
     */
    where?: Prisma.PlayerPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerPicks to fetch.
     */
    orderBy?: Prisma.PlayerPickOrderByWithRelationInput | Prisma.PlayerPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PlayerPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PlayerPicks
    **/
    _count?: true | PlayerPickCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PlayerPickAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PlayerPickSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PlayerPickMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PlayerPickMaxAggregateInputType;
};
export type GetPlayerPickAggregateType<T extends PlayerPickAggregateArgs> = {
    [P in keyof T & keyof AggregatePlayerPick]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePlayerPick[P]> : Prisma.GetScalarType<T[P], AggregatePlayerPick[P]>;
};
export type PlayerPickGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlayerPickWhereInput;
    orderBy?: Prisma.PlayerPickOrderByWithAggregationInput | Prisma.PlayerPickOrderByWithAggregationInput[];
    by: Prisma.PlayerPickScalarFieldEnum[] | Prisma.PlayerPickScalarFieldEnum;
    having?: Prisma.PlayerPickScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PlayerPickCountAggregateInputType | true;
    _avg?: PlayerPickAvgAggregateInputType;
    _sum?: PlayerPickSumAggregateInputType;
    _min?: PlayerPickMinAggregateInputType;
    _max?: PlayerPickMaxAggregateInputType;
};
export type PlayerPickGroupByOutputType = {
    id: string;
    seasonUserId: string;
    matchId: string;
    playerName: string;
    isCaptain: boolean;
    points: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: PlayerPickCountAggregateOutputType | null;
    _avg: PlayerPickAvgAggregateOutputType | null;
    _sum: PlayerPickSumAggregateOutputType | null;
    _min: PlayerPickMinAggregateOutputType | null;
    _max: PlayerPickMaxAggregateOutputType | null;
};
type GetPlayerPickGroupByPayload<T extends PlayerPickGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PlayerPickGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PlayerPickGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PlayerPickGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PlayerPickGroupByOutputType[P]>;
}>>;
export type PlayerPickWhereInput = {
    AND?: Prisma.PlayerPickWhereInput | Prisma.PlayerPickWhereInput[];
    OR?: Prisma.PlayerPickWhereInput[];
    NOT?: Prisma.PlayerPickWhereInput | Prisma.PlayerPickWhereInput[];
    id?: Prisma.StringFilter<"PlayerPick"> | string;
    seasonUserId?: Prisma.StringFilter<"PlayerPick"> | string;
    matchId?: Prisma.StringFilter<"PlayerPick"> | string;
    playerName?: Prisma.StringFilter<"PlayerPick"> | string;
    isCaptain?: Prisma.BoolFilter<"PlayerPick"> | boolean;
    points?: Prisma.IntNullableFilter<"PlayerPick"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"PlayerPick"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PlayerPick"> | Date | string;
    seasonUser?: Prisma.XOR<Prisma.SeasonUserScalarRelationFilter, Prisma.SeasonUserWhereInput>;
    match?: Prisma.XOR<Prisma.MatchScalarRelationFilter, Prisma.MatchWhereInput>;
};
export type PlayerPickOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    playerName?: Prisma.SortOrder;
    isCaptain?: Prisma.SortOrder;
    points?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    seasonUser?: Prisma.SeasonUserOrderByWithRelationInput;
    match?: Prisma.MatchOrderByWithRelationInput;
};
export type PlayerPickWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PlayerPickWhereInput | Prisma.PlayerPickWhereInput[];
    OR?: Prisma.PlayerPickWhereInput[];
    NOT?: Prisma.PlayerPickWhereInput | Prisma.PlayerPickWhereInput[];
    seasonUserId?: Prisma.StringFilter<"PlayerPick"> | string;
    matchId?: Prisma.StringFilter<"PlayerPick"> | string;
    playerName?: Prisma.StringFilter<"PlayerPick"> | string;
    isCaptain?: Prisma.BoolFilter<"PlayerPick"> | boolean;
    points?: Prisma.IntNullableFilter<"PlayerPick"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"PlayerPick"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PlayerPick"> | Date | string;
    seasonUser?: Prisma.XOR<Prisma.SeasonUserScalarRelationFilter, Prisma.SeasonUserWhereInput>;
    match?: Prisma.XOR<Prisma.MatchScalarRelationFilter, Prisma.MatchWhereInput>;
}, "id">;
export type PlayerPickOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    playerName?: Prisma.SortOrder;
    isCaptain?: Prisma.SortOrder;
    points?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.PlayerPickCountOrderByAggregateInput;
    _avg?: Prisma.PlayerPickAvgOrderByAggregateInput;
    _max?: Prisma.PlayerPickMaxOrderByAggregateInput;
    _min?: Prisma.PlayerPickMinOrderByAggregateInput;
    _sum?: Prisma.PlayerPickSumOrderByAggregateInput;
};
export type PlayerPickScalarWhereWithAggregatesInput = {
    AND?: Prisma.PlayerPickScalarWhereWithAggregatesInput | Prisma.PlayerPickScalarWhereWithAggregatesInput[];
    OR?: Prisma.PlayerPickScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PlayerPickScalarWhereWithAggregatesInput | Prisma.PlayerPickScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"PlayerPick"> | string;
    seasonUserId?: Prisma.StringWithAggregatesFilter<"PlayerPick"> | string;
    matchId?: Prisma.StringWithAggregatesFilter<"PlayerPick"> | string;
    playerName?: Prisma.StringWithAggregatesFilter<"PlayerPick"> | string;
    isCaptain?: Prisma.BoolWithAggregatesFilter<"PlayerPick"> | boolean;
    points?: Prisma.IntNullableWithAggregatesFilter<"PlayerPick"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"PlayerPick"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"PlayerPick"> | Date | string;
};
export type PlayerPickCreateInput = {
    id?: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    seasonUser: Prisma.SeasonUserCreateNestedOneWithoutPlayerPicksInput;
    match: Prisma.MatchCreateNestedOneWithoutPicksInput;
};
export type PlayerPickUncheckedCreateInput = {
    id?: string;
    seasonUserId: string;
    matchId: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerPickUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    seasonUser?: Prisma.SeasonUserUpdateOneRequiredWithoutPlayerPicksNestedInput;
    match?: Prisma.MatchUpdateOneRequiredWithoutPicksNestedInput;
};
export type PlayerPickUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    matchId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerPickCreateManyInput = {
    id?: string;
    seasonUserId: string;
    matchId: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerPickUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerPickUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    matchId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerPickListRelationFilter = {
    every?: Prisma.PlayerPickWhereInput;
    some?: Prisma.PlayerPickWhereInput;
    none?: Prisma.PlayerPickWhereInput;
};
export type PlayerPickOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PlayerPickCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    playerName?: Prisma.SortOrder;
    isCaptain?: Prisma.SortOrder;
    points?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlayerPickAvgOrderByAggregateInput = {
    points?: Prisma.SortOrder;
};
export type PlayerPickMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    playerName?: Prisma.SortOrder;
    isCaptain?: Prisma.SortOrder;
    points?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlayerPickMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonUserId?: Prisma.SortOrder;
    matchId?: Prisma.SortOrder;
    playerName?: Prisma.SortOrder;
    isCaptain?: Prisma.SortOrder;
    points?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlayerPickSumOrderByAggregateInput = {
    points?: Prisma.SortOrder;
};
export type PlayerPickCreateNestedManyWithoutSeasonUserInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput> | Prisma.PlayerPickCreateWithoutSeasonUserInput[] | Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput | Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput[];
    createMany?: Prisma.PlayerPickCreateManySeasonUserInputEnvelope;
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
};
export type PlayerPickUncheckedCreateNestedManyWithoutSeasonUserInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput> | Prisma.PlayerPickCreateWithoutSeasonUserInput[] | Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput | Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput[];
    createMany?: Prisma.PlayerPickCreateManySeasonUserInputEnvelope;
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
};
export type PlayerPickUpdateManyWithoutSeasonUserNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput> | Prisma.PlayerPickCreateWithoutSeasonUserInput[] | Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput | Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput[];
    upsert?: Prisma.PlayerPickUpsertWithWhereUniqueWithoutSeasonUserInput | Prisma.PlayerPickUpsertWithWhereUniqueWithoutSeasonUserInput[];
    createMany?: Prisma.PlayerPickCreateManySeasonUserInputEnvelope;
    set?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    disconnect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    delete?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    update?: Prisma.PlayerPickUpdateWithWhereUniqueWithoutSeasonUserInput | Prisma.PlayerPickUpdateWithWhereUniqueWithoutSeasonUserInput[];
    updateMany?: Prisma.PlayerPickUpdateManyWithWhereWithoutSeasonUserInput | Prisma.PlayerPickUpdateManyWithWhereWithoutSeasonUserInput[];
    deleteMany?: Prisma.PlayerPickScalarWhereInput | Prisma.PlayerPickScalarWhereInput[];
};
export type PlayerPickUncheckedUpdateManyWithoutSeasonUserNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput> | Prisma.PlayerPickCreateWithoutSeasonUserInput[] | Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput | Prisma.PlayerPickCreateOrConnectWithoutSeasonUserInput[];
    upsert?: Prisma.PlayerPickUpsertWithWhereUniqueWithoutSeasonUserInput | Prisma.PlayerPickUpsertWithWhereUniqueWithoutSeasonUserInput[];
    createMany?: Prisma.PlayerPickCreateManySeasonUserInputEnvelope;
    set?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    disconnect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    delete?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    update?: Prisma.PlayerPickUpdateWithWhereUniqueWithoutSeasonUserInput | Prisma.PlayerPickUpdateWithWhereUniqueWithoutSeasonUserInput[];
    updateMany?: Prisma.PlayerPickUpdateManyWithWhereWithoutSeasonUserInput | Prisma.PlayerPickUpdateManyWithWhereWithoutSeasonUserInput[];
    deleteMany?: Prisma.PlayerPickScalarWhereInput | Prisma.PlayerPickScalarWhereInput[];
};
export type PlayerPickCreateNestedManyWithoutMatchInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutMatchInput, Prisma.PlayerPickUncheckedCreateWithoutMatchInput> | Prisma.PlayerPickCreateWithoutMatchInput[] | Prisma.PlayerPickUncheckedCreateWithoutMatchInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutMatchInput | Prisma.PlayerPickCreateOrConnectWithoutMatchInput[];
    createMany?: Prisma.PlayerPickCreateManyMatchInputEnvelope;
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
};
export type PlayerPickUncheckedCreateNestedManyWithoutMatchInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutMatchInput, Prisma.PlayerPickUncheckedCreateWithoutMatchInput> | Prisma.PlayerPickCreateWithoutMatchInput[] | Prisma.PlayerPickUncheckedCreateWithoutMatchInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutMatchInput | Prisma.PlayerPickCreateOrConnectWithoutMatchInput[];
    createMany?: Prisma.PlayerPickCreateManyMatchInputEnvelope;
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
};
export type PlayerPickUpdateManyWithoutMatchNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutMatchInput, Prisma.PlayerPickUncheckedCreateWithoutMatchInput> | Prisma.PlayerPickCreateWithoutMatchInput[] | Prisma.PlayerPickUncheckedCreateWithoutMatchInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutMatchInput | Prisma.PlayerPickCreateOrConnectWithoutMatchInput[];
    upsert?: Prisma.PlayerPickUpsertWithWhereUniqueWithoutMatchInput | Prisma.PlayerPickUpsertWithWhereUniqueWithoutMatchInput[];
    createMany?: Prisma.PlayerPickCreateManyMatchInputEnvelope;
    set?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    disconnect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    delete?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    update?: Prisma.PlayerPickUpdateWithWhereUniqueWithoutMatchInput | Prisma.PlayerPickUpdateWithWhereUniqueWithoutMatchInput[];
    updateMany?: Prisma.PlayerPickUpdateManyWithWhereWithoutMatchInput | Prisma.PlayerPickUpdateManyWithWhereWithoutMatchInput[];
    deleteMany?: Prisma.PlayerPickScalarWhereInput | Prisma.PlayerPickScalarWhereInput[];
};
export type PlayerPickUncheckedUpdateManyWithoutMatchNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerPickCreateWithoutMatchInput, Prisma.PlayerPickUncheckedCreateWithoutMatchInput> | Prisma.PlayerPickCreateWithoutMatchInput[] | Prisma.PlayerPickUncheckedCreateWithoutMatchInput[];
    connectOrCreate?: Prisma.PlayerPickCreateOrConnectWithoutMatchInput | Prisma.PlayerPickCreateOrConnectWithoutMatchInput[];
    upsert?: Prisma.PlayerPickUpsertWithWhereUniqueWithoutMatchInput | Prisma.PlayerPickUpsertWithWhereUniqueWithoutMatchInput[];
    createMany?: Prisma.PlayerPickCreateManyMatchInputEnvelope;
    set?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    disconnect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    delete?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    connect?: Prisma.PlayerPickWhereUniqueInput | Prisma.PlayerPickWhereUniqueInput[];
    update?: Prisma.PlayerPickUpdateWithWhereUniqueWithoutMatchInput | Prisma.PlayerPickUpdateWithWhereUniqueWithoutMatchInput[];
    updateMany?: Prisma.PlayerPickUpdateManyWithWhereWithoutMatchInput | Prisma.PlayerPickUpdateManyWithWhereWithoutMatchInput[];
    deleteMany?: Prisma.PlayerPickScalarWhereInput | Prisma.PlayerPickScalarWhereInput[];
};
export type PlayerPickCreateWithoutSeasonUserInput = {
    id?: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    match: Prisma.MatchCreateNestedOneWithoutPicksInput;
};
export type PlayerPickUncheckedCreateWithoutSeasonUserInput = {
    id?: string;
    matchId: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerPickCreateOrConnectWithoutSeasonUserInput = {
    where: Prisma.PlayerPickWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlayerPickCreateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput>;
};
export type PlayerPickCreateManySeasonUserInputEnvelope = {
    data: Prisma.PlayerPickCreateManySeasonUserInput | Prisma.PlayerPickCreateManySeasonUserInput[];
    skipDuplicates?: boolean;
};
export type PlayerPickUpsertWithWhereUniqueWithoutSeasonUserInput = {
    where: Prisma.PlayerPickWhereUniqueInput;
    update: Prisma.XOR<Prisma.PlayerPickUpdateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedUpdateWithoutSeasonUserInput>;
    create: Prisma.XOR<Prisma.PlayerPickCreateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedCreateWithoutSeasonUserInput>;
};
export type PlayerPickUpdateWithWhereUniqueWithoutSeasonUserInput = {
    where: Prisma.PlayerPickWhereUniqueInput;
    data: Prisma.XOR<Prisma.PlayerPickUpdateWithoutSeasonUserInput, Prisma.PlayerPickUncheckedUpdateWithoutSeasonUserInput>;
};
export type PlayerPickUpdateManyWithWhereWithoutSeasonUserInput = {
    where: Prisma.PlayerPickScalarWhereInput;
    data: Prisma.XOR<Prisma.PlayerPickUpdateManyMutationInput, Prisma.PlayerPickUncheckedUpdateManyWithoutSeasonUserInput>;
};
export type PlayerPickScalarWhereInput = {
    AND?: Prisma.PlayerPickScalarWhereInput | Prisma.PlayerPickScalarWhereInput[];
    OR?: Prisma.PlayerPickScalarWhereInput[];
    NOT?: Prisma.PlayerPickScalarWhereInput | Prisma.PlayerPickScalarWhereInput[];
    id?: Prisma.StringFilter<"PlayerPick"> | string;
    seasonUserId?: Prisma.StringFilter<"PlayerPick"> | string;
    matchId?: Prisma.StringFilter<"PlayerPick"> | string;
    playerName?: Prisma.StringFilter<"PlayerPick"> | string;
    isCaptain?: Prisma.BoolFilter<"PlayerPick"> | boolean;
    points?: Prisma.IntNullableFilter<"PlayerPick"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"PlayerPick"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PlayerPick"> | Date | string;
};
export type PlayerPickCreateWithoutMatchInput = {
    id?: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    seasonUser: Prisma.SeasonUserCreateNestedOneWithoutPlayerPicksInput;
};
export type PlayerPickUncheckedCreateWithoutMatchInput = {
    id?: string;
    seasonUserId: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerPickCreateOrConnectWithoutMatchInput = {
    where: Prisma.PlayerPickWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlayerPickCreateWithoutMatchInput, Prisma.PlayerPickUncheckedCreateWithoutMatchInput>;
};
export type PlayerPickCreateManyMatchInputEnvelope = {
    data: Prisma.PlayerPickCreateManyMatchInput | Prisma.PlayerPickCreateManyMatchInput[];
    skipDuplicates?: boolean;
};
export type PlayerPickUpsertWithWhereUniqueWithoutMatchInput = {
    where: Prisma.PlayerPickWhereUniqueInput;
    update: Prisma.XOR<Prisma.PlayerPickUpdateWithoutMatchInput, Prisma.PlayerPickUncheckedUpdateWithoutMatchInput>;
    create: Prisma.XOR<Prisma.PlayerPickCreateWithoutMatchInput, Prisma.PlayerPickUncheckedCreateWithoutMatchInput>;
};
export type PlayerPickUpdateWithWhereUniqueWithoutMatchInput = {
    where: Prisma.PlayerPickWhereUniqueInput;
    data: Prisma.XOR<Prisma.PlayerPickUpdateWithoutMatchInput, Prisma.PlayerPickUncheckedUpdateWithoutMatchInput>;
};
export type PlayerPickUpdateManyWithWhereWithoutMatchInput = {
    where: Prisma.PlayerPickScalarWhereInput;
    data: Prisma.XOR<Prisma.PlayerPickUpdateManyMutationInput, Prisma.PlayerPickUncheckedUpdateManyWithoutMatchInput>;
};
export type PlayerPickCreateManySeasonUserInput = {
    id?: string;
    matchId: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerPickUpdateWithoutSeasonUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    match?: Prisma.MatchUpdateOneRequiredWithoutPicksNestedInput;
};
export type PlayerPickUncheckedUpdateWithoutSeasonUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    matchId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerPickUncheckedUpdateManyWithoutSeasonUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    matchId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerPickCreateManyMatchInput = {
    id?: string;
    seasonUserId: string;
    playerName: string;
    isCaptain?: boolean;
    points?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerPickUpdateWithoutMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    seasonUser?: Prisma.SeasonUserUpdateOneRequiredWithoutPlayerPicksNestedInput;
};
export type PlayerPickUncheckedUpdateWithoutMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerPickUncheckedUpdateManyWithoutMatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerName?: Prisma.StringFieldUpdateOperationsInput | string;
    isCaptain?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    points?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerPickSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonUserId?: boolean;
    matchId?: boolean;
    playerName?: boolean;
    isCaptain?: boolean;
    points?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["playerPick"]>;
export type PlayerPickSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonUserId?: boolean;
    matchId?: boolean;
    playerName?: boolean;
    isCaptain?: boolean;
    points?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["playerPick"]>;
export type PlayerPickSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonUserId?: boolean;
    matchId?: boolean;
    playerName?: boolean;
    isCaptain?: boolean;
    points?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["playerPick"]>;
export type PlayerPickSelectScalar = {
    id?: boolean;
    seasonUserId?: boolean;
    matchId?: boolean;
    playerName?: boolean;
    isCaptain?: boolean;
    points?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type PlayerPickOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "seasonUserId" | "matchId" | "playerName" | "isCaptain" | "points" | "createdAt" | "updatedAt", ExtArgs["result"]["playerPick"]>;
export type PlayerPickInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
};
export type PlayerPickIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
};
export type PlayerPickIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    seasonUser?: boolean | Prisma.SeasonUserDefaultArgs<ExtArgs>;
    match?: boolean | Prisma.MatchDefaultArgs<ExtArgs>;
};
export type $PlayerPickPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PlayerPick";
    objects: {
        seasonUser: Prisma.$SeasonUserPayload<ExtArgs>;
        match: Prisma.$MatchPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        seasonUserId: string;
        matchId: string;
        playerName: string;
        isCaptain: boolean;
        points: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["playerPick"]>;
    composites: {};
};
export type PlayerPickGetPayload<S extends boolean | null | undefined | PlayerPickDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload, S>;
export type PlayerPickCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PlayerPickFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PlayerPickCountAggregateInputType | true;
};
export interface PlayerPickDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PlayerPick'];
        meta: {
            name: 'PlayerPick';
        };
    };
    /**
     * Find zero or one PlayerPick that matches the filter.
     * @param {PlayerPickFindUniqueArgs} args - Arguments to find a PlayerPick
     * @example
     * // Get one PlayerPick
     * const playerPick = await prisma.playerPick.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlayerPickFindUniqueArgs>(args: Prisma.SelectSubset<T, PlayerPickFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one PlayerPick that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlayerPickFindUniqueOrThrowArgs} args - Arguments to find a PlayerPick
     * @example
     * // Get one PlayerPick
     * const playerPick = await prisma.playerPick.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlayerPickFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PlayerPickFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PlayerPick that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerPickFindFirstArgs} args - Arguments to find a PlayerPick
     * @example
     * // Get one PlayerPick
     * const playerPick = await prisma.playerPick.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlayerPickFindFirstArgs>(args?: Prisma.SelectSubset<T, PlayerPickFindFirstArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PlayerPick that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerPickFindFirstOrThrowArgs} args - Arguments to find a PlayerPick
     * @example
     * // Get one PlayerPick
     * const playerPick = await prisma.playerPick.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlayerPickFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PlayerPickFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more PlayerPicks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerPickFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlayerPicks
     * const playerPicks = await prisma.playerPick.findMany()
     *
     * // Get first 10 PlayerPicks
     * const playerPicks = await prisma.playerPick.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const playerPickWithIdOnly = await prisma.playerPick.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PlayerPickFindManyArgs>(args?: Prisma.SelectSubset<T, PlayerPickFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a PlayerPick.
     * @param {PlayerPickCreateArgs} args - Arguments to create a PlayerPick.
     * @example
     * // Create one PlayerPick
     * const PlayerPick = await prisma.playerPick.create({
     *   data: {
     *     // ... data to create a PlayerPick
     *   }
     * })
     *
     */
    create<T extends PlayerPickCreateArgs>(args: Prisma.SelectSubset<T, PlayerPickCreateArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many PlayerPicks.
     * @param {PlayerPickCreateManyArgs} args - Arguments to create many PlayerPicks.
     * @example
     * // Create many PlayerPicks
     * const playerPick = await prisma.playerPick.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PlayerPickCreateManyArgs>(args?: Prisma.SelectSubset<T, PlayerPickCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many PlayerPicks and returns the data saved in the database.
     * @param {PlayerPickCreateManyAndReturnArgs} args - Arguments to create many PlayerPicks.
     * @example
     * // Create many PlayerPicks
     * const playerPick = await prisma.playerPick.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PlayerPicks and only return the `id`
     * const playerPickWithIdOnly = await prisma.playerPick.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PlayerPickCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PlayerPickCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a PlayerPick.
     * @param {PlayerPickDeleteArgs} args - Arguments to delete one PlayerPick.
     * @example
     * // Delete one PlayerPick
     * const PlayerPick = await prisma.playerPick.delete({
     *   where: {
     *     // ... filter to delete one PlayerPick
     *   }
     * })
     *
     */
    delete<T extends PlayerPickDeleteArgs>(args: Prisma.SelectSubset<T, PlayerPickDeleteArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one PlayerPick.
     * @param {PlayerPickUpdateArgs} args - Arguments to update one PlayerPick.
     * @example
     * // Update one PlayerPick
     * const playerPick = await prisma.playerPick.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PlayerPickUpdateArgs>(args: Prisma.SelectSubset<T, PlayerPickUpdateArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more PlayerPicks.
     * @param {PlayerPickDeleteManyArgs} args - Arguments to filter PlayerPicks to delete.
     * @example
     * // Delete a few PlayerPicks
     * const { count } = await prisma.playerPick.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PlayerPickDeleteManyArgs>(args?: Prisma.SelectSubset<T, PlayerPickDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PlayerPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerPickUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlayerPicks
     * const playerPick = await prisma.playerPick.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PlayerPickUpdateManyArgs>(args: Prisma.SelectSubset<T, PlayerPickUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PlayerPicks and returns the data updated in the database.
     * @param {PlayerPickUpdateManyAndReturnArgs} args - Arguments to update many PlayerPicks.
     * @example
     * // Update many PlayerPicks
     * const playerPick = await prisma.playerPick.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more PlayerPicks and only return the `id`
     * const playerPickWithIdOnly = await prisma.playerPick.updateManyAndReturn({
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
    updateManyAndReturn<T extends PlayerPickUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PlayerPickUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one PlayerPick.
     * @param {PlayerPickUpsertArgs} args - Arguments to update or create a PlayerPick.
     * @example
     * // Update or create a PlayerPick
     * const playerPick = await prisma.playerPick.upsert({
     *   create: {
     *     // ... data to create a PlayerPick
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlayerPick we want to update
     *   }
     * })
     */
    upsert<T extends PlayerPickUpsertArgs>(args: Prisma.SelectSubset<T, PlayerPickUpsertArgs<ExtArgs>>): Prisma.Prisma__PlayerPickClient<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of PlayerPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerPickCountArgs} args - Arguments to filter PlayerPicks to count.
     * @example
     * // Count the number of PlayerPicks
     * const count = await prisma.playerPick.count({
     *   where: {
     *     // ... the filter for the PlayerPicks we want to count
     *   }
     * })
    **/
    count<T extends PlayerPickCountArgs>(args?: Prisma.Subset<T, PlayerPickCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PlayerPickCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a PlayerPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerPickAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PlayerPickAggregateArgs>(args: Prisma.Subset<T, PlayerPickAggregateArgs>): Prisma.PrismaPromise<GetPlayerPickAggregateType<T>>;
    /**
     * Group by PlayerPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerPickGroupByArgs} args - Group by arguments.
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
    groupBy<T extends PlayerPickGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PlayerPickGroupByArgs['orderBy'];
    } : {
        orderBy?: PlayerPickGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PlayerPickGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlayerPickGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PlayerPick model
     */
    readonly fields: PlayerPickFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for PlayerPick.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PlayerPickClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    seasonUser<T extends Prisma.SeasonUserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SeasonUserDefaultArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    match<T extends Prisma.MatchDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MatchDefaultArgs<ExtArgs>>): Prisma.Prisma__MatchClient<runtime.Types.Result.GetResult<Prisma.$MatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the PlayerPick model
 */
export interface PlayerPickFieldRefs {
    readonly id: Prisma.FieldRef<"PlayerPick", 'String'>;
    readonly seasonUserId: Prisma.FieldRef<"PlayerPick", 'String'>;
    readonly matchId: Prisma.FieldRef<"PlayerPick", 'String'>;
    readonly playerName: Prisma.FieldRef<"PlayerPick", 'String'>;
    readonly isCaptain: Prisma.FieldRef<"PlayerPick", 'Boolean'>;
    readonly points: Prisma.FieldRef<"PlayerPick", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"PlayerPick", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"PlayerPick", 'DateTime'>;
}
/**
 * PlayerPick findUnique
 */
export type PlayerPickFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * Filter, which PlayerPick to fetch.
     */
    where: Prisma.PlayerPickWhereUniqueInput;
};
/**
 * PlayerPick findUniqueOrThrow
 */
export type PlayerPickFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * Filter, which PlayerPick to fetch.
     */
    where: Prisma.PlayerPickWhereUniqueInput;
};
/**
 * PlayerPick findFirst
 */
export type PlayerPickFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * Filter, which PlayerPick to fetch.
     */
    where?: Prisma.PlayerPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerPicks to fetch.
     */
    orderBy?: Prisma.PlayerPickOrderByWithRelationInput | Prisma.PlayerPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlayerPicks.
     */
    cursor?: Prisma.PlayerPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlayerPicks.
     */
    distinct?: Prisma.PlayerPickScalarFieldEnum | Prisma.PlayerPickScalarFieldEnum[];
};
/**
 * PlayerPick findFirstOrThrow
 */
export type PlayerPickFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * Filter, which PlayerPick to fetch.
     */
    where?: Prisma.PlayerPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerPicks to fetch.
     */
    orderBy?: Prisma.PlayerPickOrderByWithRelationInput | Prisma.PlayerPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlayerPicks.
     */
    cursor?: Prisma.PlayerPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlayerPicks.
     */
    distinct?: Prisma.PlayerPickScalarFieldEnum | Prisma.PlayerPickScalarFieldEnum[];
};
/**
 * PlayerPick findMany
 */
export type PlayerPickFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * Filter, which PlayerPicks to fetch.
     */
    where?: Prisma.PlayerPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerPicks to fetch.
     */
    orderBy?: Prisma.PlayerPickOrderByWithRelationInput | Prisma.PlayerPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PlayerPicks.
     */
    cursor?: Prisma.PlayerPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlayerPicks.
     */
    distinct?: Prisma.PlayerPickScalarFieldEnum | Prisma.PlayerPickScalarFieldEnum[];
};
/**
 * PlayerPick create
 */
export type PlayerPickCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * The data needed to create a PlayerPick.
     */
    data: Prisma.XOR<Prisma.PlayerPickCreateInput, Prisma.PlayerPickUncheckedCreateInput>;
};
/**
 * PlayerPick createMany
 */
export type PlayerPickCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlayerPicks.
     */
    data: Prisma.PlayerPickCreateManyInput | Prisma.PlayerPickCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * PlayerPick createManyAndReturn
 */
export type PlayerPickCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * The data used to create many PlayerPicks.
     */
    data: Prisma.PlayerPickCreateManyInput | Prisma.PlayerPickCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * PlayerPick update
 */
export type PlayerPickUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * The data needed to update a PlayerPick.
     */
    data: Prisma.XOR<Prisma.PlayerPickUpdateInput, Prisma.PlayerPickUncheckedUpdateInput>;
    /**
     * Choose, which PlayerPick to update.
     */
    where: Prisma.PlayerPickWhereUniqueInput;
};
/**
 * PlayerPick updateMany
 */
export type PlayerPickUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update PlayerPicks.
     */
    data: Prisma.XOR<Prisma.PlayerPickUpdateManyMutationInput, Prisma.PlayerPickUncheckedUpdateManyInput>;
    /**
     * Filter which PlayerPicks to update
     */
    where?: Prisma.PlayerPickWhereInput;
    /**
     * Limit how many PlayerPicks to update.
     */
    limit?: number;
};
/**
 * PlayerPick updateManyAndReturn
 */
export type PlayerPickUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * The data used to update PlayerPicks.
     */
    data: Prisma.XOR<Prisma.PlayerPickUpdateManyMutationInput, Prisma.PlayerPickUncheckedUpdateManyInput>;
    /**
     * Filter which PlayerPicks to update
     */
    where?: Prisma.PlayerPickWhereInput;
    /**
     * Limit how many PlayerPicks to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * PlayerPick upsert
 */
export type PlayerPickUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * The filter to search for the PlayerPick to update in case it exists.
     */
    where: Prisma.PlayerPickWhereUniqueInput;
    /**
     * In case the PlayerPick found by the `where` argument doesn't exist, create a new PlayerPick with this data.
     */
    create: Prisma.XOR<Prisma.PlayerPickCreateInput, Prisma.PlayerPickUncheckedCreateInput>;
    /**
     * In case the PlayerPick was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PlayerPickUpdateInput, Prisma.PlayerPickUncheckedUpdateInput>;
};
/**
 * PlayerPick delete
 */
export type PlayerPickDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    /**
     * Filter which PlayerPick to delete.
     */
    where: Prisma.PlayerPickWhereUniqueInput;
};
/**
 * PlayerPick deleteMany
 */
export type PlayerPickDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PlayerPicks to delete
     */
    where?: Prisma.PlayerPickWhereInput;
    /**
     * Limit how many PlayerPicks to delete.
     */
    limit?: number;
};
/**
 * PlayerPick without action
 */
export type PlayerPickDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=PlayerPick.d.ts.map